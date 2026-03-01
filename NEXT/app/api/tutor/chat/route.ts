import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId: existingId, apiKey } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Campo 'message' é obrigatório." },
        { status: 400 }
      );
    }
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "Chave da API Gemini é obrigatória (apiKey)." },
        { status: 400 }
      );
    }

    const [
      { tutorChat },
      {
        createConversation,
        getMessagesByConversationId,
        addMessages,
      },
    ] = await Promise.all([
      import("@/services/TutorAgent"),
      import("@/services/conversationRepository"),
    ]);

    let conversationId = existingId as string | undefined;
    let history: Array<{ sender: "user" | "ai"; text: string }> = [];

    if (conversationId) {
      const messages = await getMessagesByConversationId(conversationId);
      history = messages.map((m) => ({
        sender: m.role === "user" ? "user" : "ai",
        text: m.content,
      }));
    } else {
      const conv = await createConversation();
      conversationId = conv.id;
    }

    const answer = await tutorChat(message, history, apiKey);

    await addMessages(conversationId, [
      { role: "user", content: message },
      { role: "assistant", content: answer },
    ]);

    return NextResponse.json({ answer, conversationId });
  } catch (error: unknown) {
    console.error("Error in tutor chat API:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
