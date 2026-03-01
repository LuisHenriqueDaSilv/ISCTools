import { prisma } from "@/lib/db";

export async function createConversation() {
  return prisma.conversation.create({
    data: {},
  });
}

export async function getConversationById(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getMessagesByConversationId(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  return prisma.message.create({
    data: { conversationId, role, content },
  });
}

export async function addMessages(
  conversationId: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
) {
  await prisma.message.createMany({
    data: messages.map((m) => ({ conversationId, role: m.role, content: m.content })),
  });
}
