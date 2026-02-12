import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../../shared/utils/logger.js";

interface AIRequest {
    prompt: string;
    context?: string;
    mode: "fix-grammar" | "summarize" | "generate" | "rewrite" | "shorter" | "longer";
}

// Model priority list as requested
const MODELS = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateContentWithFallback(genAI: GoogleGenerativeAI, systemInstruction: string, userMessage: string): Promise<string> {
    let lastError: any;

    for (const modelName of MODELS) {
        try {
            logger.info({ msg: `Attempting generation with model`, model: modelName });
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: userMessage }] }],
                systemInstruction: { role: "user", parts: [{ text: systemInstruction }] },
            });

            const response = result.response;
            if (!response) throw new Error("No response from model");

            return response.text();

        } catch (error: any) {
            logger.warn({ msg: `Model ${modelName} failed`, error: error.message });
            lastError = error;

            // Check for quota/rate limit errors specifically (429) or Service Unavailable (503)
            const isRateLimit = error.message?.includes("429") || error.status === 429;
            const isServiceUnavail = error.message?.includes("503") || error.status === 503;
            // Also handle "Not Found" if model name is invalid (404)
            const isNotFound = error.message?.includes("404") || error.status === 404;

            if (isRateLimit || isServiceUnavail || isNotFound) {
                // Continue to next model
                continue;
            }

            // specific error that shouldn't trigger fallback? currently falling back for safety.
        }
    }

    throw lastError || new Error("All models failed to generate content");
}


export async function processAIRequest({ prompt, context, mode }: AIRequest): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    let systemInstruction =
        "You are a helpful AI writing assistant. You MUST use strict CommonMark Markdown formatting.\n" +
        "- Use dash `-` for unordered lists (NOT `*`).\n" +
        "- Use `**text**` for bold, `*text*` for italic.\n" +
        "- Do NOT generate images. Avoid `![...]` syntax completely.\n" +
        "- Use standard Markdown tables (`| Header | ...`).\n" +
        "- Use `#` for headings.\n" +
        "- Do NOT use HTML tags.\n" +
        "- Do NOT use excessive decorative symbols.";

    let userMessage = prompt;

    // Base instruction context
    if (context) {
        systemInstruction += `\n\nExisting Document Context (for style/content reference only):\n${context}\n\n`;
    }

    // Add specific instructions based on mode
    switch (mode) {
        case "fix-grammar":
            systemInstruction += "\n\nFix grammar, spelling, and punctuation. Return ONLY the corrected text.";
            userMessage = `CONTEXT TO FIX:\n"${context || prompt}"\n\nINSTRUCTION: Fix grammar in the above text.`;
            break;

        case "summarize":
            systemInstruction += "\n\nSummarize the text concisely. Return ONLY the summary.";
            userMessage = `CONTEXT TO SUMMARIZE:\n"${context || prompt}"\n\nINSTRUCTION: Summarize the above text.`;
            break;

        case "rewrite":
            systemInstruction += "\n\nRewrite the text to be clearer and professional. Return ONLY the rewritten text.";
            userMessage = `CONTEXT TO REWRITE:\n"${context || prompt}"\n\nINSTRUCTION: Rewrite the above text following this guidance: ${prompt}`;
            break;

        case "longer":
            systemInstruction += "\n\nExpand the text with details. Return ONLY the expanded text.";
            userMessage = `CONTEXT TO EXPAND:\n"${context || prompt}"`;
            break;

        case "shorter":
            systemInstruction += "\n\nShorten the text. Return ONLY the shortened text.";
            userMessage = `CONTEXT TO SHORTEN:\n"${context || prompt}"`;
            break;

        case "generate":
        default:
            // For generation, instruction is key
            userMessage = `INSTRUCTION: ${prompt}\n\n(Use the provided document context only for style consistency, do not repeat it unless asked.)`;
            break;
    }

    try {
        let responseText = await generateContentWithFallback(genAI, systemInstruction, userMessage);

        // Cleanup basic markdown fences if present
        responseText = responseText.replace(/^```(html|json|markdown)?\s*/i, "").replace(/\s*```$/, "");

        return responseText.trim();
    } catch (error) {
        logger.error({ err: error }, "Gemini AI Request failed after fallbacks");
        throw new Error("Failed to process AI request");
    }
}

export async function generateDailyQuote(): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemInstruction = "You are a daily motivation bot. Output exactly 4 to 5 words. No more, no less. Be inspiring. Do not use quotes, just the words.";
    const userMessage = "Give me a daily quote.";

    try {
        let text = await generateContentWithFallback(genAI, systemInstruction, userMessage);
        return text.trim().replace(/^["']|["']$/g, ''); // Remove quotes if any
    } catch (error) {
        logger.error({ err: error }, "Daily Quote generation failed");
        return "Conquer your day with code."; // Fallback static quote
    }
}
