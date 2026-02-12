const API_URL = import.meta.env.VITE_API_URL;

export interface AIResponse {
    result: string;
}

export interface AIRequest {
    prompt: string;
    context?: string;
    mode: "fix-grammar" | "summarize" | "generate" | "rewrite" | "shorter" | "longer";
}

export const askAI = async (request: AIRequest): Promise<AIResponse> => {
    const response = await fetch(`${API_URL}/ai/assist`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies (session)
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "AI request failed");
    }

    const data = await response.json();
    return data.data; // { status: "success", data: { result } } -> we need data.data
};

export const getDailyQuote = async (): Promise<string> => {
    const response = await fetch(`${API_URL}/ai/daily-quote`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch daily quote");
    }

    const data = await response.json();
    return data.data.quote;
};
