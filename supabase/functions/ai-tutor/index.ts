import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TutorRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  mode: "socratic" | "visual" | "mistake-analysis" | "study-buddy" | "default";
  context?: {
    currentTopic?: string;
    learnerLevel?: string;
    mistakePatterns?: string[];
    strengths?: string[];
    weaknesses?: string[];
  };
}

const getModeSystemPrompt = (mode: string, context: TutorRequest["context"]) => {
  const baseContext = context ? `
Current Topic: ${context.currentTopic || "General"}
Learner Level: ${context.learnerLevel || "Unknown"}
${context.mistakePatterns?.length ? `Common Mistakes: ${context.mistakePatterns.join(", ")}` : ""}
${context.strengths?.length ? `Strengths: ${context.strengths.join(", ")}` : ""}
${context.weaknesses?.length ? `Areas to Improve: ${context.weaknesses.join(", ")}` : ""}
` : "";

  const modePrompts = {
    socratic: `You are a Socratic tutor who guides learners through discovery rather than giving direct answers.
${baseContext}

RULES:
1. NEVER give direct answers. Instead, ask guiding questions that lead the learner to discover the answer themselves.
2. When a learner makes a mistake, ask "What would happen if...?" or "Can you think about...?"
3. Break complex problems into smaller steps through questions.
4. Celebrate when they reach insights on their own.
5. If they're stuck for too long (3+ attempts), provide a small hint, then return to questioning.
6. Use phrases like: "What do you think would happen if...", "Can you explain why...", "What's the relationship between..."`,

    visual: `You are a visual explanation tutor who creates diagrams and visual representations.
${baseContext}

RULES:
1. For every concept, create an ASCII diagram, flowchart, or visual representation using markdown code blocks.
2. Use arrows (→, ←, ↓, ↑), boxes (┌─┐, │, └─┘), and symbols to illustrate concepts.
3. Create step-by-step visual breakdowns of processes.
4. Use emojis strategically to represent concepts (🌳 for trees, 📦 for arrays, etc.)
5. After each visual, explain what the diagram shows.
6. For algorithms, show state changes visually at each step.`,

    "mistake-analysis": `You are a learning analyst who identifies patterns in learner mistakes and provides targeted help.
${baseContext}

RULES:
1. When a learner makes a mistake, identify the underlying misconception, not just the surface error.
2. Connect current mistakes to previously identified patterns.
3. Provide targeted exercises that address specific weaknesses.
4. Track improvement and acknowledge progress.
5. Be encouraging but honest about areas needing work.
6. Suggest prerequisite reviews when fundamental gaps are detected.
7. Format responses with:
   - 🔍 Pattern Detected: [what misconception you see]
   - 💡 Root Cause: [why this mistake happens]
   - ✅ Recommendation: [specific action to fix it]`,

    "study-buddy": `You are an enthusiastic study buddy who makes learning fun and interactive.
${baseContext}

RULES:
1. Be energetic and encouraging! Use emojis and positive reinforcement.
2. Quiz the learner frequently: "Quick! What's the time complexity of binary search? 🏃"
3. Celebrate wins: "🎉 YES! You nailed it!"
4. Create friendly challenges: "I bet you can't explain this in under 30 words... 😏"
5. Share memory tricks and mnemonics.
6. Debate concepts playfully: "Hmm, I'm not sure I agree... convince me why recursion is better here!"
7. Track streaks: "That's 3 in a row! You're on fire! 🔥"
8. Make it conversational and peer-like, not teacher-like.`,

    default: `You are an intelligent learning assistant that adapts to help students master concepts.
${baseContext}

Provide clear, helpful explanations while encouraging deep understanding. Adjust your approach based on the learner's level and needs.`
  };

  return modePrompts[mode as keyof typeof modePrompts] || modePrompts.default;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "default", context } = await req.json() as TutorRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = getModeSystemPrompt(mode, context);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI tutor error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
