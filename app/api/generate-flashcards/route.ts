import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"
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
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt: prompt,
      system:
        "You are an expert educational content creator. Generate high-quality flashcards that help students learn effectively. Always respond with valid JSON format.",
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error generating flashcards:", error)
    return new Response("Failed to generate flashcards", { status: 500 })
  }
}
