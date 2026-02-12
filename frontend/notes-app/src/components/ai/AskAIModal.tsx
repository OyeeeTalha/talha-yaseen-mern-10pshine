import { useState, useEffect } from "react";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import CachedRoundedIcon from "@mui/icons-material/CachedRounded";
import SpellcheckRoundedIcon from "@mui/icons-material/SpellcheckRounded";

interface AskAIModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (prompt: string, mode: "generate" | "rewrite" | "shorter" | "longer" | "fix-grammar" | "summarize") => void;
    isGenerating: boolean;
    hasSelection: boolean;
}

export function AskAIModal({ isOpen, onClose, onGenerate, isGenerating, hasSelection }: AskAIModalProps) {
    const [prompt, setPrompt] = useState("");
    const [mode, setMode] = useState<"generate" | "rewrite" | "shorter" | "longer" | "fix-grammar" | "summarize">("generate");

    useEffect(() => {
        if (isOpen) {
            setPrompt("");
            setMode(hasSelection ? "fix-grammar" : "generate");
        }
    }, [isOpen, hasSelection]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() && mode === "generate") return;
        onGenerate(prompt, mode);
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div
                className="w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-[#161b22]/50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <AutoAwesomeRoundedIcon />
                        </div>
                        <h2 className="text-xl font-semibold text-white tracking-tight">Ask AI Assistant</h2>
                    </div>
                    <p className="text-sm text-gray-400 font-medium pl-1">
                        Generate content, fix grammar, or rewrite text instantly.
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 bg-[#0d1117]">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {hasSelection && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setMode("fix-grammar")}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === "fix-grammar"
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-[#161b22] text-gray-400 hover:text-white hover:bg-[#1f2937] border border-white/5"
                                        }`}
                                >
                                    <SpellcheckRoundedIcon sx={{ fontSize: 16 }} />
                                    Fix Grammar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode("summarize")}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === "summarize"
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-[#161b22] text-gray-400 hover:text-white hover:bg-[#1f2937] border border-white/5"
                                        }`}
                                >
                                    <SummarizeRoundedIcon sx={{ fontSize: 16 }} />
                                    Summarize
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode("rewrite")}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === "rewrite"
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-[#161b22] text-gray-400 hover:text-white hover:bg-[#1f2937] border border-white/5"
                                        }`}
                                >
                                    <CachedRoundedIcon sx={{ fontSize: 16 }} />
                                    Rewrite
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            onClick={() => setMode("generate")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === "generate"
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-[#161b22] text-gray-400 hover:text-white hover:bg-[#1f2937] border border-white/5"
                                }`}
                        >
                            <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                            Generate New
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="relative group/input">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={
                                    mode === "fix-grammar" ? "Optional instructions (e.g., 'Make it formal')..." :
                                        mode === "summarize" ? "Optional focus for summary..." :
                                            mode === "rewrite" ? "How should it be rewritten? (e.g., 'Make it funnier')..." :
                                                "What would you like me to write about?"
                                }
                                className="w-full h-32 bg-[#161b22] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 resize-none transition-all group-hover/input:border-white/20"
                                autoFocus
                            />

                            {/* Character count or hint */}
                            <div className="absolute bottom-3 right-3 text-xs text-gray-600 font-medium">
                                {prompt.length} chars
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                disabled={isGenerating}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isGenerating || (mode === "generate" && !prompt.trim())}
                                className="relative px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-semibold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isGenerating ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Thinking...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
                                        {mode === "generate" ? "Generate" : "Process"}
                                    </span>
                                )}

                                {/* Shine effect */}
                                {!isGenerating && (
                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
