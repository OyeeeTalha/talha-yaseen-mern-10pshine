import { useMutation } from "@tanstack/react-query";
import { askAI } from "../services/aiService";
import type { AIRequest, AIResponse } from "../services/aiService";

export const useAI = () => {
    return useMutation<AIResponse, Error, AIRequest>({
        mutationFn: askAI,
    });
};

import { useQuery } from "@tanstack/react-query";
import { getDailyQuote } from "../services/aiService";

export const useGetDailyQuote = () => {
    return useQuery({
        queryKey: ["dailyQuote"],
        queryFn: getDailyQuote,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        refetchOnWindowFocus: false,
    });
};
