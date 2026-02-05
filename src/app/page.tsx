"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function Home() {
  const progects = useQuery(api.projects.get);
  const createProject = useMutation(api.projects.create);
  const remooveProject = useMutation(api.projects.remove);  
  return (
    <div>
      <Button onClick={() => createProject({ name: "My Project" })}>
        Create Project
      </Button>
      <div className="w-auto p-4 ">
      <ul className="list-disc pl-0">
        <li className="font-bold">Projects:</li>
        <div className="w-auto p-4 border-2 rounded-2xl">
        {progects?.map((project) => (
          <li key={project._id} className="flex items-center gap-2 p-2 border-2 rounded-lg mb-2">
            <div className="flex-1">
              <p className="font-bold">{project.name}</p>
              <p>Owner ID: {project.ownerId}</p>
            </div>
            <Button className="self-end" onClick={() => remooveProject({ projectId: project._id })}>
              Remove Project
            </Button>
          </li>
        ))}
        </div>
      </ul>
      </div>
    </div>
  );
}
