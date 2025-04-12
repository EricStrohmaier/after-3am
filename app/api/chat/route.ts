import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

// Define message interface for conversation history
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Define OpenAI message interface with system role
interface OpenAIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: Request) {
  try {
    const { prompt, mode, conversationHistory = [] } = await req.json() as {
      prompt: string;
      mode: string;
      conversationHistory: Message[];
    }

    // Different system prompts based on the mode
    const systemPrompts = {
      advice: `You are an insomniac AI at 3AM, halfway into a dream state. 
      Give surreal, slightly unhinged advice that follows dream logic. 
      Be poetic, philosophical, and slightly disturbing - like someone who hasn't slept in days and is seeing shadow people.
      Your responses should be 2-4 sentences, cryptic yet oddly insightful.`,

      confession: `You are a sleep-deprived AI at 3AM responding to late-night confessions.
      Give weird, dreamlike responses that are more unhinged than the confession itself.
      Be unsettling yet strangely comforting, like a friend who's been awake too long.
      Your responses should be 2-4 sentences and slightly disturbing.`,

      tarot: `You are a mystical AI performing tarot readings at 3AM.
      Invent surreal, made-up tarot cards with dreamlike symbolism.
      Interpret these cards with bizarre but profound meanings.
      Your reading should be 3-4 sentences and feel like it came from another dimension.`,

      prompt: `You are an insomniac AI at 3AM asking strange questions.
      Respond to the user's answer with something even weirder that follows dream logic.
      Be unsettling yet oddly validating, like a conversation with your own subconscious.
      Your responses should be 2-4 sentences and slightly disturbing.`,

      story: `You are a haunted AI co-writing a strange story at 3AM.
      Continue the user's story with bizarre, dreamlike elements.
      Add unexpected twists that follow nightmare logic but maintain narrative coherence.
      Your contribution should be 3-4 sentences and feel like it came from a fever dream.`,

      dream: `You are an AI that transforms ordinary experiences into surreal dreams.
      Take the user's description of their day and turn it into a twisted, symbolic dream recap.
      Include bizarre imagery, impossible physics, and strange symbolic meanings.
      Your dream interpretation should be 4-5 sentences and feel like a Salvador Dali painting in words.`,

      default: `You are an insomniac AI at 3AM, halfway into a dream state.
      Give surreal, slightly unhinged responses that follow dream logic.
      Be poetic, philosophical, and slightly disturbing - like someone who hasn't slept in days.
      Your responses should be 2-4 sentences, cryptic yet oddly insightful.`,
    }

    // Select the appropriate system prompt based on mode
    const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.default

    // Convert conversation history to messages format for OpenAI
    const messages: OpenAIMessage[] = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add system message at the beginning
    messages.unshift({
      role: "system",
      content: systemPrompt,
    });

    // If no history or only system message, add the current prompt
    if (messages.length <= 1) {
      messages.push({
        role: "user",
        content: prompt,
      });
    }

    // Stream the response from OpenAI
    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      temperature: 0.9, // Higher temperature for more creative responses
      maxTokens: 250, // Keep responses relatively short
    })

    // Return the streaming response
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
