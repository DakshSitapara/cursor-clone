import { z } from "zod";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

import { inngest } from "@/inngest/client";

const requestSchema = z.object({
  projectId: z.string(),
  repoName: z.string().min(1).max(100),
  visibility: z.enum(["public", "private"]).default("private"),
  description: z.string().max(350).optional(),
});

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, repoName, visibility, description } =
    requestSchema.parse(body);

  const client = await clerkClient();
  const tokens = await client.users.getUserOauthAccessToken(userId, "github");

  const githubToken = tokens.data[0]?.token;

  if (!githubToken) {
    return NextResponse.json(
      { error: "Github not connected, Please reconnect your github account" },
      { status: 400 },
    );
  }

  const internalKey = process.env.CURSOR_CLONE_CONVEX_INTERNAL_KEY;

  if (!internalKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const event = await inngest.send({
    name: "github/export.repo",
    data: {
      projectId,
      githubToken,
      repoName,
      visibility,
      description,
      internalKey,
    },
  });

  return NextResponse.json({ success: true, projectId, eventId: event.ids[0] });
}
