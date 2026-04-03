import { useState, useEffect, useRef, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";

import { buildFileTree, getFilePath } from "../utils/file-tree";

import { Id } from "../../../../convex/_generated/dataModel";

import { useFiles } from "@/features/projects/hooks/use-files";

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

const getWebContainer = async () => {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }
  if (!bootPromise) {
    bootPromise = WebContainer.boot({ coep: "credentialless" });
  }
  webcontainerInstance = await bootPromise;
  return webcontainerInstance;
};

const teardownWebContainer = () => {
  if (webcontainerInstance) {
    webcontainerInstance.teardown();
    webcontainerInstance = null;
  }
  bootPromise = null;
};

interface UsewebcontainerProps {
  projectId: Id<"projects">;
  enabled: boolean;
  settings?: {
    installCommand?: string;
    devCommand?: string;
  };
}

export const useWebcontainer = ({
  projectId,
  enabled,
  settings,
}: UsewebcontainerProps) => {
  const [status, setStatus] = useState<
    "idle" | "booting" | "installing" | "running" | "error"
  >("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState("");

  const containerRef = useRef<WebContainer | null>(null);
  const hasStartedRef = useRef(false);

  const files = useFiles(projectId);

  useEffect(() => {
    if (!enabled || !files || files.length === 0 || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const start = async () => {
      try {
        setStatus("booting");
        setError(null);
        setTerminalOutput("");

        const appendOutput = (data: string) => {
          setTerminalOutput((prev) => prev + data);
        };

        const container = await getWebContainer();
        containerRef.current = container;

        const fileTree = buildFileTree(files);
        await container.mount(fileTree);

        const hasPackageJson = files.some((f) => {
          const filePath = getFilePath(
            f,
            new Map(files.map((file) => [file._id, file])),
          );
          return filePath === "package.json" && f.type === "file";
        });
        if (!hasPackageJson) {
          throw new Error(
            "package.json not found. Please ensure your project has a package.json file.",
          );
        }

        const filesMap = new Map(files.map((file) => [file._id, file]));
        for (const file of files) {
          if (file.type !== "file") continue;

          const filePath = getFilePath(file, filesMap);

          if (
            file.content !== undefined &&
            file.content !== null &&
            file.content !== ""
          ) {
            try {
              await container.fs.writeFile(filePath, file.content);
            } catch (err) {
              console.error(`Failed to write file ${filePath}:`, err);
              appendOutput(`Warning: Failed to write ${filePath}\n`);
            }
          }
        }

        container.on("server-ready", (_port, url) => {
          setPreviewUrl(url);
          setStatus("running");
        });

        setStatus("installing");

        const installCmd = settings?.installCommand || "npm install";
        const [installBin, ...installArgs] = installCmd?.split(" ");
        appendOutput(`$ ${installCmd}\n`);

        try {
          const installProcess = await container.spawn(installBin, installArgs);
          installProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                appendOutput(data);
              },
            }),
          );

          const installPromise = installProcess.exit;
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(
              () => {
                reject(
                  new Error(
                    "Installation timed out after 5 minutes. Try checking your dependencies or network connection.",
                  ),
                );
              },
              5 * 60 * 1000,
            );
          });

          const installExitCode = await Promise.race([
            installPromise,
            timeoutPromise,
          ]);

          if (installExitCode !== 0) {
            throw new Error(
              `Installation failed with exit code ${installExitCode}. Check the terminal output for details.`,
            );
          }
        } catch (installError) {
          throw new Error(
            `Installation failed: ${installError instanceof Error ? installError.message : "Unknown error"}`,
          );
        }

        const devCmd = settings?.devCommand || "npm run dev";
        const [devBin, ...devArgs] = devCmd?.split(" ");
        appendOutput(`\n$ ${devCmd}\n`);

        try {
          const devProcess = await container.spawn(devBin, devArgs);
          devProcess.output.pipeTo(
            new WritableStream({
              write(data) {
                appendOutput(data);
              },
            }),
          );

          devProcess.exit.then((exitCode) => {
            if (exitCode !== 0 && status !== "error") {
              setError(`Dev server exited with code ${exitCode}`);
              setStatus("error");
            }
          });

          setTimeout(() => {
            if (status === "installing") {
              setStatus("running");
            }
          }, 10000);
        } catch (spawnError) {
          throw new Error(
            `Failed to start dev server: ${spawnError instanceof Error ? spawnError.message : "Unknown error"}. Check your dev command in settings.`,
          );
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
        setStatus("error");
      }
    };

    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    files,
    restartKey,
    settings?.devCommand,
    settings?.installCommand,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !files || status !== "running") return;

    const filesMap = new Map(files.map((file) => [file._id, file]));

    const updateFiles = async () => {
      for (const file of files) {
        if (file.type !== "file") continue;

        const filePath = getFilePath(file, filesMap);

        if (
          file.content !== undefined &&
          file.content !== null &&
          file.content !== ""
        ) {
          try {
            await container.fs.writeFile(filePath, file.content);
          } catch (err) {
            console.error(`Failed to update file ${filePath}:`, err);
          }
        }
      }
    };

    const timeoutId = setTimeout(updateFiles, 500);
    return () => clearTimeout(timeoutId);
  }, [files, status]);

  useEffect(() => {
    if (!enabled) {
      hasStartedRef.current = false;
      setStatus("idle");
      setPreviewUrl(null);
      setError(null);
      setTerminalOutput("");
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (containerRef.current) {
        try {
          containerRef.current.teardown();
        } catch (err) {
          console.error("Error during cleanup:", err);
        }
      }
    };
  }, []);

  const restart = useCallback(() => {
    try {
      teardownWebContainer();
    } catch (err) {
      console.error("Error during teardown:", err);
    }
    containerRef.current = null;
    hasStartedRef.current = false;
    setStatus("idle");
    setError(null);
    setPreviewUrl(null);
    setTerminalOutput("");
    setRestartKey((prev) => prev + 1);
  }, []);

  return {
    status,
    previewUrl,
    error,
    restart,
    terminalOutput,
  };
};
