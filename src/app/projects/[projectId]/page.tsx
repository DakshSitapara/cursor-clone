import { ProjectIdView } from "@/features/projects/components/project-id-view";
import { Id } from "../../../../convex/_generated/dataModel";
import { notFound } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

const ProjectPage = async ({
  params,
}: {
  params: Promise<{
    projectId: string;
  }>;
}) => {
  const { projectId } = await params;

  if (!projectId || typeof projectId !== "string") {
    notFound();
  }

  try {
    const projectExists = await fetchQuery(api.projects.exists, {
      id: projectId as Id<"projects">,
    });

    if (!projectExists) {
      notFound();
    }
  } catch {
    notFound();
  }

  return <ProjectIdView projectId={projectId as Id<"projects">} />;
};

export default ProjectPage;
