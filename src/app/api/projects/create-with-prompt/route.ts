import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  colors,
  animals,
  adjectives,
  uniqueNamesGenerator,
} from "unique-names-generator";

import { DEFAULT_CONVERSATION_TITLE } from "@/features/conversations/constants";

import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";

const requestSchema = z.object({
  prompt: z.string().min(1),
});

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const internalKey = process.env.CURSOR_CLONE_CONVEX_INTERNAL_KEY;

  if (!internalKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  const body = await req.json();
  const { prompt } = requestSchema.parse(body);

  const projectName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    length: 3,
  });

  const { projectId, conversationId } = await convex.mutation(
    api.system.createProjectWithConversations,
    {
      internalKey,
      projectName,
      ownerId: userId,
      conversationTitle: DEFAULT_CONVERSATION_TITLE,
    },
  );

  await convex.mutation(api.system.createMessage, {
    internalKey,
    projectId,
    conversationId,
    role: "user",
    content: prompt,
  });

  const assistantMessageId = await convex.mutation(api.system.createMessage, {
    internalKey,
    projectId,
    conversationId,
    role: "assistant",
    content: "",
    status: "processing",
  });

  await inngest.send({
    name: "message/sent",
    data: {
      projectId,
      conversationId,
      message: prompt,
      messageId: assistantMessageId,
    },
  });

  return NextResponse.json({ projectId });
}
