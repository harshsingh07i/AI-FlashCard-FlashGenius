import { streamText } from "ai"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { content, difficulty, cardCount, cardType } = await request.json()

    if (!content) {
      return new Response("Content is required", { status: 400 })
    }

    const prompt = `Generate ${cardCount} flashcards from the following content. 
    Difficulty level: ${difficulty}
    Card type: ${cardType}
    
    Content: ${content}
    
    Please format the response as a JSON array of objects, where each object has:
    - "question": the question or front of the card
    - "answer": the answer or back of the card
    - "difficulty": "${difficulty}"
    - "type": "${cardType}"
    
    Make sure the questions are clear and the answers are concise but complete.
    
    Content to process:
    ${content}`

    const result = streamText({
      model: "xai/grok-2",
      prompt: prompt,
      system:
        "You are an expert educational content creator. Generate high-quality flashcards that help students learn effectively. Always respond with valid JSON format.",
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error generating flashcards:", error)

    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes("exhausted") || errorMessage.includes("spending limit")) {
      return new Response(
        JSON.stringify({
          error: "API credits exhausted. Please check your xAI account or contact support.",
        }),
        { status: 429 },
      )
    }

    return new Response(JSON.stringify({ error: "Failed to generate flashcards" }), { status: 500 })
  }
}
