import { ProjectIdLayout } from "@/features/projects/components/project-id-layout";
import { Id } from "../../../../convex/_generated/dataModel";
import { notFound } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

const Layout = async ({
    children,
    params
 }: {
    children: React.ReactNode,
    params: Promise<{ projectId: string }>
 }) => {

     const { projectId } = await params;

     if (!projectId || typeof projectId !== 'string') {
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

     return (
      <ProjectIdLayout projectId={projectId as Id<"projects">}>
        {children}
      </ProjectIdLayout>
    );
}

export default Layout;