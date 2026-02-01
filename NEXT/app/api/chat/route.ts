import { NextRequest, NextResponse } from "next/server";
import { lamarzitoAgent } from "@/services/LamarzitoAgent";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const answer = await lamarzitoAgent.chat(message, history || []);

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
