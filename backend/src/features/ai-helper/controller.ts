import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import { processAIRequest, generateDailyQuote } from "./gemini.js";

interface AIRequestBody {
    prompt: string;
    context?: string;
    mode: "fix-grammar" | "summarize" | "generate" | "rewrite" | "shorter" | "longer";
}

export async function handleAIRequest(req: Request, res: Response, next: NextFunction) {
    try {
        const { prompt, context, mode } = req.body as AIRequestBody;

        if (!mode) {
            return next(new AppError("Mode is required", 400));
        }

        if (mode === "generate" && !prompt) {
            return next(new AppError("Prompt is required for generation", 400));
        }

        const result = await processAIRequest({ prompt, context, mode });

        res.status(200).json({
            status: "success",
            data: {
                result,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function handleDailyQuoteRequest(req: Request, res: Response, next: NextFunction) {
    try {
        const quote = await generateDailyQuote();
        res.status(200).json({
            status: "success",
            data: {
                quote,
            },
        });
    } catch (error) {
        next(error);
    }
}
