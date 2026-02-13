import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useState, useMemo, useEffect } from "react";
// @ts-ignore - Handle potential ESM/CommonJS interop issues manually or via * import
import * as Diff from 'diff';

interface AIPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    originalText?: string;
    generatedText: string;
    isReplacing: boolean;
}

export function AIPreviewModal({
    isOpen,
    onClose,
    onAccept,
    originalText,
    generatedText,
    isReplacing,
}: AIPreviewModalProps) {
    const [viewMode, setViewMode] = useState<"preview" | "diff">("diff");

    useEffect(() => {
        if (isOpen) {
            console.log("AIPreviewModal Mounted/Updated:", {
                isOpen,
                isReplacing,
                originalTextLen: originalText?.length,
                generatedTextLen: generatedText?.length,
                viewMode
            });
        }
    }, [isOpen, isReplacing, originalText, generatedText, viewMode]);

    // Compute diff lines safely
    const diff = useMemo(() => {
        if (!isOpen) return [];
        console.log("Computing Diff...", { original: originalText, generated: generatedText });

        try {
            if (!isReplacing) return [];

            // If originalText is missing/empty, treat as all added
            if (!originalText) {
                console.log("Original text missing, treating as addition");
                return [{ value: generatedText, added: true, removed: false, count: 1 }];
            }

            // Ensure Diff object exists (interop check)
            const diffLib = Diff.default || Diff;
            if (!diffLib || !diffLib.diffLines) {
                console.error("Diff library not found or invalid:", Diff);
                // Fallback
                return [{ value: generatedText, added: true, removed: false, count: 1 }];
            }

            const computedDiff = diffLib.diffLines(originalText, generatedText);
            console.log("Computed Diff Result:", computedDiff);

            // Filter out empty parts just in case
            return computedDiff;
        } catch (e) {
            console.error("Diff calculation failed:", e);
            // Fallback to showing all new
            return [{ value: generatedText, added: true, removed: false, count: 1 }];
        }
    }, [originalText, generatedText, isReplacing, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div
                className="w-full max-w-4xl bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[85vh] ring-1 ring-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-[#161b22]/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <AutoAwesomeRoundedIcon />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white tracking-tight">Review Suggestion</h2>
                            <p className="text-sm text-gray-400 font-medium">
                                {isReplacing ? "Review changes before applying" : "Review generated content"}
                            </p>
                        </div>
                    </div>

                    {isReplacing && (
                        <div className="flex bg-[#161b22] rounded-lg p-1 border border-white/5 ring-1 ring-white/5">
                            <button
                                onClick={() => setViewMode("diff")}
                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === "diff"
                                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                                    : "text-gray-400 hover:text-gray-200"
                                    }`}
                            >
                                Diff View
                            </button>
                            <button
                                onClick={() => setViewMode("preview")}
                                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === "preview"
                                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                                    : "text-gray-400 hover:text-gray-200"
                                    }`}
                            >
                                Final Result
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-0 overflow-hidden flex-1 bg-[#0d1117] relative flex flex-col">
                    {/* Debug Info (Hidden in prod, visible via logs) */}
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6">
                        <div className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
                            {viewMode === "diff" && isReplacing ? (
                                <div className="flex flex-col gap-1 pb-4">
                                    {(!diff || diff.length === 0) && (
                                        <div className="text-gray-500 italic px-3 py-2 border border-gray-800 rounded p-4 bg-gray-900/50">
                                            No differences detected.
                                            <span className="block text-xs mt-2 text-gray-600">
                                                (Original len: {originalText?.length || 0}, Generated len: {generatedText?.length || 0})
                                            </span>
                                        </div>
                                    )}
                                    {diff.map((part: any, index: number) => {
                                        // Semantic Diff Colors - Keep Green/Red for logic, but refine look
                                        const isAdded = part.added;
                                        const isRemoved = part.removed;
                                        const hasContent = part.value && part.value.length > 0;

                                        if (!hasContent) return null;

                                        if (!isAdded && !isRemoved) {
                                            return (
                                                <div key={index} className="w-full text-gray-400 px-3 py-1 border-l-2 border-transparent opacity-90">
                                                    {part.value}
                                                </div>
                                            );
                                        }

                                        const bgColor = isAdded ? "bg-emerald-500/10" : "bg-red-500/10";
                                        const textColor = isAdded ? "text-emerald-400" : "text-red-400 line-through opacity-80";
                                        const borderColor = isAdded ? "border-emerald-500/50" : "border-red-500/50";
                                        const icon = isAdded ? "+" : "-";

                                        return (
                                            <div key={index} className={`w-full ${bgColor} ${textColor} px-3 py-1 rounded-r-md border-l-2 ${borderColor} flex group relative`}>
                                                <span className="w-4 select-none opacity-50 font-bold mr-2 shrink-0">{icon}</span>
                                                <span className="break-words whitespace-pre-wrap">{part.value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-gray-300 px-4 leading-7">
                                    {generatedText}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/5 bg-[#161b22]/80 backdrop-blur-md flex items-center justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-semibold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
                        {isReplacing ? "Accept Changes" : "Insert Content"}
                    </button>
                </div>
            </div>
        </div>
    );
}
