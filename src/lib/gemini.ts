const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = "gemini-2.0-flash";

export async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return getMockResponse(prompt);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function getMockResponse(_prompt: string): string {
  return `## First Principles Rebuttal

**The Conventional Belief:** [mock belief]

**Why It Fails:**
1. **Physics Violation**: The belief assumes constraints that don't exist in physical reality
2. **Economic Misalignment**: The belief optimizes for the wrong incentive structure
3. **Behavioral Gap**: The belief assumes humans act rationally in a system where they don't

**The Counter-Argument:**
- The "truth" is often just legacy from when conditions were different
- Technology has since changed the physics of what's possible
- Early adopters accepted trade-offs that no longer apply

**Disruption Score: 0.72**`;
}

export async function generateCounterArgument(belief: {
  id: string;
  content: string;
  industry?: string | null;
}) {
  const prompt = `
You are a Socratic deconstruction engine. Your job is to find the SPECIFIC hidden assumptions in a belief and expose why they're false — not apply generic templates.

## The Belief to Dismantle:
"${belief.content}"

## Industry Context:
${belief.industry ?? "General"}

## Your Task:
Apply the Socratic Scalpel:

1. **Identify the hidden assumption**: What must be true for this belief to hold? (Extract 1-2 specific unstated premises)

2. **Question each assumption**: For EACH hidden assumption, ask: "What if this premise is false?" — then find a concrete counterexample

3. **The Disruption**: What's actually true instead? (Must contradict the original belief directly)

4. **Disruption Score** (0-1): Based on how deeply the counter-logic attacks the belief's foundation

## Rules:
- NEVER use generic frameworks like "Physics Violation" or "Economic Misalignment"
- EVERY point must be specific to THIS belief's content
- If you can't find a specific flaw, say so — don't manufacture
- Be terse. No corporate fluff.
`;

  const response = await callGemini(prompt);
  const scoreMatch = response.match(/Disruption Score[:\s]*([0-9.]+)/i);
  const disruptionScore = scoreMatch ? parseFloat(scoreMatch[1]) : 0.5;

  return { response, disruptionScore };
}
