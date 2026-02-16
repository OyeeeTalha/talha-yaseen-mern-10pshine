import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn"; // Using shadcn interface
import "@blocknote/shadcn/style.css";
import Sidebar from "@/components/layouts/Sidebar";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";

import { Button } from "@/components/ui/button";
import { useGetNoteById, useUpdateNote } from "@/hooks/useNotes";
import { useGetCategories, useCreateCategory } from "@/hooks/useCategories";
import { useGetProfile } from "@/hooks/useUser";
import Loading from "@/components/ui/loading";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";
import { logger } from "@/lib/logger";
import { socketService } from "@/services/socketService";
import { debounce } from "@/lib/utils";
import { ShareNoteModal } from "@/components/ShareNoteModal";
import { AskAIModal } from "@/components/ai/AskAIModal";
import { AIPreviewModal } from "@/components/ai/AIPreviewModal";

import { useAI } from "@/hooks/useAI";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

type AutosaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

function Editor() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if this is a shared note (passed via navigation state)
  const sharedNoteState = location.state as {
    isSharedNote?: boolean;
    accessLevel?: "readonly" | "edit" | "owner";
    ownerName?: string;
    shareId?: string;
  } | null;

  // Debug: Log mount/unmount and noteId changes
  useEffect(() => {
    logger.info({ msg: "Editor Mounted", noteId });
    return () => logger.info({ msg: "Editor Unmounted", noteId });
  }, [noteId]);

  const isSharedNote = sharedNoteState?.isSharedNote || false;
  const sharedAccessLevel = sharedNoteState?.accessLevel || "owner";
  const sharedOwnerName = sharedNoteState?.ownerName || "Unknown";
  const isReadOnly = isSharedNote && sharedAccessLevel === "readonly";
  const canEdit = !isReadOnly;

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [activeSidebarItem, setActiveSidebarItem] = useState("All Notes");
  const [isSaving, setIsSaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // AI State
  const [isAskAIOpen, setIsAskAIOpen] = useState(false);
  const [isPreviewAIOpen, setIsPreviewAIOpen] = useState(false);


  const [isReviewingAI, setIsReviewingAI] = useState(false);
  const [aiContext, setAiContext] = useState("");
  const [aiContextType, setAiContextType] = useState<"selection" | "document">("selection");
  const [selectedBlocks, setSelectedBlocks] = useState<any[]>([]); // Using any[] to avoid strict BlockNote typing import issues for now
  const [aiResult, setAiResult] = useState("");
  const [aiMode, setAiMode] = useState<"generate" | "rewrite" | "shorter" | "longer" | "fix-grammar" | "summarize">("generate");
  const { mutate: generateAI, isPending: isGeneratingAI } = useAI();


  // Toast hook
  const { toasts, hideToast, success, error: showError } = useToast();

  // Hooks
  const { data: noteData, isLoading: isLoadingNote } = useGetNoteById(
    noteId || "",
  );
  const { data: profileData } = useGetProfile();

  const { data: categoriesData } = useGetCategories();
  const updateNote = useUpdateNote();
  const createCategory = useCreateCategory();

  const categories = useMemo(() => categoriesData || [], [categoriesData]);

  // Initialize editable state with data from noteData - will update when noteData changes
  const [title, setTitle] = useState(() => noteData?.title || "Untitled Note");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    () => noteData?.category || null,
  );
  const [tags, setTags] = useState<string[]>(() => noteData?.tags || []);

  // Refs to hold current state for autosave (prevents re-creating debounced function)
  const titleRef = useRef(title);
  const categoryRef = useRef(selectedCategoryId);
  const tagsRef = useRef(tags);

  // Update refs when state changes
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    categoryRef.current = selectedCategoryId;
  }, [selectedCategoryId]);

  useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);

  // Sync state when switching to a different note or when data loads after refresh
  useEffect(() => {
    if (noteData) {
      setTitle(noteData.title || "Untitled Note");
      setSelectedCategoryId(noteData.category || null);
      setTags(noteData.tags || []);
    }
  }, [noteId, noteData]); // Sync when noteId changes OR when noteData loads

  // Get selected category name for display
  const selectedCategoryName = selectedCategoryId
    ? categories.find((cat) => cat.id === selectedCategoryId)?.name || "Void"
    : "Void";

  // Parse note content once - memoize based on noteData to avoid re-parsing
  const parsedContent = useMemo(() => {
    if (noteData?.content) {
      try {
        return JSON.parse(noteData.content);
      } catch (error) {
        logger.error({ msg: "Failed to parse note content", error, noteId });
        return undefined;
      }
    }
    return undefined;
  }, [noteData, noteId]);

  // Initialize BlockNote editor
  const editor = useCreateBlockNote();

  // Load content into editor when note changes
  useEffect(() => {
    if (editor && noteData) {
      if (parsedContent) {
        editor.replaceBlocks(editor.document, parsedContent);
      }
      // Mark content as loaded after a short delay (even if content is empty for new notes)
      setTimeout(() => setIsContentLoaded(true), 100);
    }
  }, [editor, parsedContent, noteData]);

  // Debounced autosave function
  const triggerAutosave = useMemo(
    () =>
      debounce(() => {
        // Don't autosave during initial load or for read-only shared notes
        if (!noteId || !editor || !isContentLoaded || isReadOnly) return;

        setAutosaveStatus("saving");

        const payload = {
          noteId,
          title: titleRef.current,
          content: JSON.stringify(editor.document),
          category: categoryRef.current,
          tags: tagsRef.current,
        };

        socketService.autosave(
          payload,
          (data) => {
            setAutosaveStatus("saved");
            setLastSavedAt(data.timestamp);
            logger.info({ msg: "Autosave complete", noteId });

            // DON'T invalidate cache - it causes content reload and adds new lines
            // The autosave already updated the backend, no need to refetch
          },
          (error) => {
            setAutosaveStatus("error");
            logger.error({ msg: "Autosave failed", error });
            showError(`Autosave failed: ${error}`);
          },
        );
      }, 2000),
    [
      noteId,
      editor,
      // title, selectedCategoryId, tags removed from dependencies to avoid reset
      isContentLoaded,
      showError,
      isReadOnly
    ],
  );

  // Initialize WebSocket and autosave
  useEffect(() => {
    if (!noteId) return;

    // Connect to WebSocket
    socketService.connect();

    // Join note room
    socketService.joinNote(
      noteId,
      () => {
        logger.info({ msg: "Joined note room", noteId });
        setAutosaveStatus("idle");
      },
      (error) => {
        logger.error({ msg: "Failed to join note room", error });
        setAutosaveStatus("error");
        showError("Failed to connect for autosave");
      },
    );

    // Cleanup on unmount or note change
    return () => {
      // Only save if content was loaded and user can edit
      // This prevents saving empty content during initial load
      if (editor && isContentLoaded && !isReadOnly) {
        const finalPayload = {
          noteId,
          title,
          content: JSON.stringify(editor.document),
          category: selectedCategoryId,
          tags,
        };

        // Use sync save for immediate effect
        socketService.saveSync(finalPayload);

        // Also trigger socket leave
        socketService.leaveNote(finalPayload);
      }
    };
  }, [noteId, editor, title, selectedCategoryId, tags, showError, isContentLoaded, isReadOnly]);

  // Handle browser close, refresh, or tab close
  useEffect(() => {
    if (!noteId || !editor) return;

    const handleBeforeUnload = () => {
      // Only save if content was loaded and user can edit
      if (!isContentLoaded || isReadOnly) return;

      // Use synchronous save for page unload (Beacon API)
      const finalPayload = {
        noteId,
        title,
        content: JSON.stringify(editor.document),
        category: selectedCategoryId,
        tags,
      };

      socketService.saveSync(finalPayload);
      socketService.leaveNote(finalPayload);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [noteId, editor, title, selectedCategoryId, tags, isContentLoaded, isReadOnly]);

  // Trigger autosave when content or metadata changes
  useEffect(() => {
    if (!noteId || !editor) return;

    const handleContentChange = () => {
      setAutosaveStatus("idle");
      triggerAutosave();
    };

    // Listen to editor changes
    editor.onChange(handleContentChange);

    return () => {
      // Cleanup
    };
  }, [editor, noteId, triggerAutosave]);

  // Trigger autosave when title, category, or tags change
  useEffect(() => {
    // Don't autosave on initial mount
    if (!noteId || !isContentLoaded) return;
    triggerAutosave();
  }, [
    title,
    selectedCategoryId,
    tags,
    noteId,
    isContentLoaded,
    triggerAutosave,
  ]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = setInterval(() => {
      if (!socketService.isConnected() && noteId) {
        setAutosaveStatus("offline");
      }
    }, 5000);

    return () => clearInterval(checkConnection);
  }, [noteId]);

  // Save Function (Manual Save)
  const handleSave = async () => {
    if (!noteId) return;

    setIsSaving(true);

    const notePayload = {
      title,
      category: selectedCategoryId,
      tags,
      content: JSON.stringify(editor.document), // Convert BlockNote blocks to JSON string
    };

    updateNote.mutate(
      { id: noteId, data: notePayload },
      {
        onSuccess: () => {
          setIsSaving(false);
          success("Note saved successfully");
        },
        onError: (error) => {
          setIsSaving(false);
          showError(`Failed to save note: ${error.message}`);
        },
      },
    );
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddCategory = () => {
    if (
      newCategoryInput.trim() &&
      !categories.some((cat) => cat.name === newCategoryInput.trim())
    ) {
      const categoryName = newCategoryInput.trim();

      // Close dropdown and clear input immediately
      setNewCategoryInput("");
      setIsCategoryDropdownOpen(false);

      createCategory.mutate(
        { name: categoryName },
        {
          onSuccess: (response) => {
            // Update to the real ID from the server
            setSelectedCategoryId(response.data.category.id);

            // Optimistically update the note with the new category
            if (noteId) {
              const notePayload = {
                title,
                category: response.data.category.id,
                tags,
                content: JSON.stringify(editor.document),
              };

              updateNote.mutate(
                { id: noteId, data: notePayload },
                {
                  onSuccess: () => {
                    success("Category assigned");
                  },
                  onError: (error) => {
                    showError(`Failed to assign category: ${error.message}`);
                  },
                },
              );
            }
          },
        },
      );
    }
  };

  // AI Handlers
  const handleAskAI = async () => {
    setAiContext("");
    setSelectedBlocks([]);

    if (!editor) return;

    const selection = editor.getSelection();

    if (selection && selection.blocks.length > 0) {
      try {
        const markdown = await editor.blocksToMarkdownLossy(selection.blocks);
        console.log("AI Context (Selection):", markdown);
        setAiContext(markdown);
        setAiContextType("selection");
        setSelectedBlocks(selection.blocks);
      } catch (error) {
        console.error("Failed to parse selection", error);
        setAiContext("");
        setAiContextType("selection");
      }
    } else {
      // No selection found, use full document content
      try {
        const markdown = await editor.blocksToMarkdownLossy(editor.document);
        console.log("AI Context (Document):", markdown);
        setAiContext(markdown);
        setAiContextType("document");
        setSelectedBlocks([]);
      } catch (error) {
        console.error("Failed to parse document", error);
        setAiContext("");
        setAiContextType("selection");
      }
    }
    setIsAskAIOpen(true);
  };

  const handleGenerateAI = (prompt: string, mode: "generate" | "rewrite" | "shorter" | "longer" | "fix-grammar" | "summarize") => {
    setAiMode(mode);

    // Capture current state values for async callback usage
    const currentContextType = aiContextType;
    const currentSelectedBlocks = selectedBlocks;

    generateAI(
      { prompt, context: aiContext, mode },
      {
        onSuccess: (data) => {
          setAiResult(data.result);
          setIsAskAIOpen(false);
          // Pass captured state explicitly to avoid stale closures
          applyAIResult(data.result, mode, currentContextType, currentSelectedBlocks);
        },
        onError: (error) => {
          logger.error({ msg: "AI Generation Failed", error });
          showError(error.message || "Failed to generate AI content");
        },
      }
    );
  };

  const [snapshotBlocks, setSnapshotBlocks] = useState<any[] | null>(null);

  const applyAIResult = async (
    result: string,
    mode: "generate" | "rewrite" | "shorter" | "longer" | "fix-grammar" | "summarize",
    contextType: "selection" | "document",
    blocksToReplace: any[]
  ) => {
    try {
      if (!editor) return;

      // Use passed result
      const contentToApply = result;
      if (!contentToApply) return;

      // TAKE SNAPSHOT BEFORE APPLYING CHANGES
      // Deep clone to ensure we have a clean copy of the state
      const currentSnapshot = JSON.parse(JSON.stringify(editor.document));
      console.log("Creation Snapshot:", currentSnapshot);
      setSnapshotBlocks(currentSnapshot);

      if (mode === "generate") {
        // Insert at cursor or append
        const currentBlock = editor.getTextCursorPosition().block;
        if (currentBlock) {
          const newBlocks = await editor.tryParseMarkdownToBlocks(contentToApply);
          editor.insertBlocks(newBlocks, currentBlock, "after");
        } else {
          const blocks = await editor.tryParseMarkdownToBlocks(contentToApply);
          // Safe append
          const lastBlock = editor.document[editor.document.length - 1];
          if (lastBlock) {
            editor.insertBlocks(blocks, lastBlock, "after");
          } else {
            editor.replaceBlocks(editor.document, blocks);
          }
        }
      } else {
        // REWRITE / FIX GRAMMAR / SUMMARIZE -> REPLACE
        const newBlocks = await editor.tryParseMarkdownToBlocks(contentToApply);

        if (contextType === "selection" && blocksToReplace.length > 0) {
          editor.replaceBlocks(blocksToReplace, newBlocks);
        } else if (contextType === "document") {
          editor.replaceBlocks(editor.document, newBlocks);
        } else {
          // Fallback: insert
          const currentBlock = editor.getTextCursorPosition().block;
          if (currentBlock) {
            editor.insertBlocks(newBlocks, currentBlock, "after");
          }
        }
      }

      setIsReviewingAI(true);
      success("AI content applied. Review changes below.");
    } catch (error) {
      logger.error({ msg: "Failed to apply AI result", error });
      showError("Failed to apply AI changes");
    }
  };

  const handleDiscardAI = () => {
    if (editor && snapshotBlocks !== null) {
      // Restore from snapshot
      logger.info({ msg: "Discarding AI changes, restoring snapshot", blocks: snapshotBlocks.length });
      editor.replaceBlocks(editor.document, snapshotBlocks);
      setSnapshotBlocks(null); // Clear snapshot
    } else {
      // Fallback if no snapshot available
      logger.warn({ msg: "No snapshot available for discard" });
      if (editor) {
        // Try generic undo as last resort
        // @ts-ignore
        const tiptap = editor._tiptapEditor as any;
        if (tiptap?.commands?.undo) tiptap.commands.undo();
      }
    }
    setIsReviewingAI(false);
  };

  if (isLoadingNote) {
    return (
      <div className="flex h-screen bg-[#0d1117] items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0d1117] text-white overflow-hidden font-poppins">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={hideToast} />

      <Sidebar
        activeItem={activeSidebarItem}
        onItemClick={setActiveSidebarItem}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#0d1117]">
        {/* Top Bar for specific note actions */}
        <header className="h-16 w-full flex items-center justify-between px-8 border-b border-white/5 shrink-0 bg-[#0d1117] z-10">
          <div className="flex items-center gap-4">
            <Button
              onClick={async () => {
                // Save synchronously before navigating
                if (editor && noteId) {
                  const payload = {
                    noteId,
                    title,
                    content: JSON.stringify(editor.document),
                    category: selectedCategoryId,
                    tags,
                  };

                  // Send sync save (Beacon API)
                  socketService.saveSync(payload);

                  // Also send socket leave message
                  socketService.leaveNote(payload);

                  // Small delay to ensure messages are sent
                  await new Promise((resolve) => setTimeout(resolve, 100));
                }

                // Now navigate
                navigate("/dashboard");
              }}
              className="text-gray-400 hover:text-white transition-colors"
              variant="ghost"
            >
              <ArrowBackRoundedIcon />
            </Button>
            <div className="flex flex-col">
              {isSharedNote ? (
                <>
                  <span className="text-sm text-gray-500">
                    Shared by {sharedOwnerName}
                  </span>
                  <span
                    className={`text-xs flex items-center gap-1 ${isReadOnly ? "text-orange-400" : "text-green-400"
                      }`}
                  >
                    {isReadOnly ? "Read-only access" : "Can edit"}
                  </span>
                  {/* Autosave Status for shared notes with edit access */}
                  {!isReadOnly && autosaveStatus !== "idle" && (
                    <span
                      className={`text-xs ${autosaveStatus === "saving"
                        ? "text-yellow-400"
                        : autosaveStatus === "saved"
                          ? "text-green-400"
                          : autosaveStatus === "offline"
                            ? "text-orange-400"
                            : "text-red-400"
                        }`}
                    >
                      {autosaveStatus === "saving" && "Saving..."}
                      {autosaveStatus === "saved" &&
                        (lastSavedAt
                          ? `Saved at ${new Date(lastSavedAt).toLocaleTimeString()}`
                          : "Saved")}
                      {autosaveStatus === "offline" &&
                        "Offline - will save when reconnected"}
                      {autosaveStatus === "error" && "Autosave error"}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-500">
                    {noteData?.updatedAt
                      ? `Last edited ${new Date(noteData.updatedAt).toLocaleString()}`
                      : "New note"}
                  </span>
                  {/* Autosave Status Indicator */}
                  {autosaveStatus !== "idle" && (
                    <span
                      className={`text-xs ${autosaveStatus === "saving"
                        ? "text-yellow-400"
                        : autosaveStatus === "saved"
                          ? "text-green-400"
                          : autosaveStatus === "offline"
                            ? "text-orange-400"
                            : "text-red-400"
                        }`}
                    >
                      {autosaveStatus === "saving" && "Saving..."}
                      {autosaveStatus === "saved" &&
                        (lastSavedAt
                          ? `Saved at ${new Date(lastSavedAt).toLocaleTimeString()}`
                          : "Saved")}
                      {autosaveStatus === "offline" &&
                        "Offline - will save when reconnected"}
                      {autosaveStatus === "error" && "Autosave error"}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Ask AI Button */}
            <div className="relative mr-2">
              <Button
                onClick={handleAskAI}
                variant="outline"
                size="sm"
                className="h-9 gap-2 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all font-medium rounded-full px-4"
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                Ask AI
              </Button>
            </div>

            {/* Only show Share button for owned notes (where user ID matches creator) */}
            {noteData?.userId === profileData?.data?.user?._id && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 hover:bg-white/10 rounded-full text-sm font-medium transition-all"
              >
                <ShareRoundedIcon sx={{ fontSize: 18 }} />
                <span>Share</span>
              </button>
            )}

            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 hover:bg-white/10 rounded-full text-sm font-medium transition-all"
              >
                <FileDownloadRoundedIcon sx={{ fontSize: 18 }} />
                <span>Export</span>
              </button>

              {isExportMenuOpen && (
                <>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#161b22] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={async () => {
                        setIsExportMenuOpen(false);
                        if (!editor) return;
                        const markdown = await editor.blocksToMarkdownLossy(
                          editor.document,
                        );
                        const fullMarkdown = `# ${title}\n\n${markdown}`;
                        const blob = new Blob([fullMarkdown], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${title}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <CodeRoundedIcon sx={{ fontSize: 16 }} />
                      Markdown (.md)
                    </button>
                    <button
                      onClick={async () => {
                        setIsExportMenuOpen(false);
                        if (!editor) return;
                        const html = await editor.blocksToHTMLLossy(editor.document);
                        const fullHtml = `<!DOCTYPE html><html><head><title>${title}</title><meta charset="utf-8"></head><body style="font-family: sans-serif; padding: 20px;"><h1>${title}</h1>${html}</body></html>`;
                        const blob = new Blob([fullHtml], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${title}.html`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <CodeRoundedIcon sx={{ fontSize: 16 }} />
                      HTML (.html)
                    </button>
                    <button
                      onClick={async () => {
                        setIsExportMenuOpen(false);
                        if (!editor) return;

                        try {
                          // Dynamic imports to keep bundle size small
                          const { PDFExporter, pdfDefaultSchemaMappings } = await import("@blocknote/xl-pdf-exporter");
                          const ReactPDFModule = await import("@react-pdf/renderer");
                          const { pdf } = ReactPDFModule;

                          // Create exporter using BlockNote's native schema mappings
                          const exporter = new PDFExporter(editor.schema, pdfDefaultSchemaMappings);

                          // Build title header element using React.createElement
                          const { createElement } = await import("react");
                          const headerEl = createElement(
                            ReactPDFModule.Text,
                            { style: { fontSize: 24, fontWeight: "bold", marginBottom: 20 } },
                            title
                          );

                          // Convert blocks to a react-pdf document with title header
                          const pdfDocument = await exporter.toReactPDFDocument(editor.document, {
                            header: headerEl,
                          });

                          // Render to blob and trigger download
                          const blob = await pdf(pdfDocument).toBlob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${title}.pdf`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error("PDF export failed:", err);
                          showError(`PDF export failed: ${err instanceof Error ? err.message : String(err)}`);
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <PictureAsPdfRoundedIcon sx={{ fontSize: 16 }} />
                      PDF (.pdf)
                    </button>
                    <button
                      onClick={async () => {
                        setIsExportMenuOpen(false);
                        if (!editor) return;
                        const html = await editor.blocksToHTMLLossy(editor.document);
                        const header =
                          "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
                          "xmlns:w='urn:schemas-microsoft-com:office:word' " +
                          "xmlns='http://www.w3.org/TR/REC-html40'>" +
                          "<head><meta charset='utf-8'><title>" +
                          title +
                          "</title></head><body><h1>" +
                          title +
                          "</h1>";
                        const footer = "</body></html>";
                        const sourceHTML = header + html + footer;

                        const blob = new Blob(["\ufeff", sourceHTML], {
                          type: "application/msword",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${title}.doc`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <DescriptionRoundedIcon sx={{ fontSize: 16 }} />
                      Word Document
                    </button>
                  </div>

                  {/* Overlay to close dropdown when clicking outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsExportMenuOpen(false)}
                  />
                </>
              )}
            </div>

            {/* Only show Save button when user can edit */}
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={isSaving || updateNote.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SaveRoundedIcon sx={{ fontSize: 18 }} />
                <span>
                  {isSaving || updateNote.isPending ? "Saving..." : "Save Now"}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Read-only Banner for shared notes */}
        {isReadOnly && (
          <div className="bg-orange-500/10 border-b border-orange-500/20 px-8 py-3 flex items-center gap-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-orange-400"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-orange-400 text-sm">
              You have view-only access to this note. Contact the owner to request edit access.
            </span>
          </div>
        )}

        {/* Share Modal - only for owned notes */}
        {noteId && !isSharedNote && (
          <ShareNoteModal
            noteId={noteId}
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
          />
        )}

        {/* Editor Content Area - Page Layout */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0d1117] p-8">
          <div className="max-w-4xl mx-auto bg-[#161b22] min-h-[calc(100vh-8rem)] rounded-xl shadow-2xl border border-white/5 flex flex-col relative">

            {/* Page Content */}
            <div className="px-16 py-16 flex-1">
              {/* Note Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => !isReadOnly && setTitle(e.target.value)}
                disabled={isReadOnly}
                readOnly={isReadOnly}
                className={`w-full bg-transparent text-5xl font-bold text-white placeholder-gray-600 border-none outline-none ring-0 p-0 mb-10 ${isReadOnly ? "cursor-not-allowed opacity-80" : ""}`}
                placeholder="Note Title"
              />

              {/* Meta Controls Grid */}
              <div className="grid grid-cols-[100px_1fr] gap-y-6 mb-10 items-start">
                {/* Category Row */}
                {noteData?.userId === profileData?.data?.user?._id && (
                  <>
                    <div className="flex items-center gap-2 text-gray-500 pt-1.5">
                      <CategoryRoundedIcon sx={{ fontSize: 18 }} />
                      <span className="text-sm font-medium">Category</span>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                        }
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-white/10 hover:bg-white/5 text-gray-300 transition-all min-w-[140px] justify-between"
                      >
                        <span>{selectedCategoryName}</span>
                        <KeyboardArrowDownRoundedIcon
                          sx={{ fontSize: 18 }}
                          className={`transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {isCategoryDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-[#1f2428] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <div className="p-1">
                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                              {/* Void option */}
                              <button
                                onClick={() => {
                                  const newCategoryId = null;
                                  setSelectedCategoryId(newCategoryId);
                                  setIsCategoryDropdownOpen(false);

                                  if (noteId) {
                                    updateNote.mutate({
                                      id: noteId,
                                      data: {
                                        title,
                                        category: newCategoryId,
                                        tags,
                                        content: JSON.stringify(editor.document),
                                      },
                                    });
                                  }
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${selectedCategoryId === null
                                  ? "bg-primary/10 text-primary"
                                  : "text-gray-300 hover:bg-white/5"
                                  }`}
                              >
                                Void
                                {selectedCategoryId === null && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                              </button>
                              {categories
                                .filter((cat) => cat.name.toLowerCase() !== "void")
                                .map((cat) => (
                                  <button
                                    key={cat.id}
                                    onClick={() => {
                                      const newCategoryId = cat.id;
                                      setSelectedCategoryId(newCategoryId);
                                      setIsCategoryDropdownOpen(false);

                                      if (noteId) {
                                        updateNote.mutate({
                                          id: noteId,
                                          data: {
                                            title,
                                            category: newCategoryId,
                                            tags,
                                            content: JSON.stringify(editor.document),
                                          },
                                        });
                                      }
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${selectedCategoryId === cat.id
                                      ? "bg-primary/10 text-primary"
                                      : "text-gray-300 hover:bg-white/5"
                                      }`}
                                  >
                                    {cat.name}
                                    {selectedCategoryId === cat.id && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    )}
                                  </button>
                                ))}
                            </div>
                            <div className="border-t border-white/10 mt-1 pt-1 px-2 py-2">
                              <div className="flex items-center gap-2 bg-[#0d1117] px-2 py-1.5 rounded-md border border-white/5 focus-within:border-primary/50 transition-colors">
                                <input
                                  type="text"
                                  value={newCategoryInput}
                                  onChange={(e) =>
                                    setNewCategoryInput(e.target.value)
                                  }
                                  placeholder="New category..."
                                  className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full"
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && handleAddCategory()
                                  }
                                />
                                <button
                                  onClick={handleAddCategory}
                                  disabled={!newCategoryInput.trim()}
                                  className="text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <AddRoundedIcon sx={{ fontSize: 16 }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Overlay */}
                      {isCategoryDropdownOpen && (
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                        />
                      )}
                    </div>
                  </>
                )}

                {/* Tags Row */}
                <div className="flex items-center gap-2 text-gray-500 pt-1.5">
                  <LocalOfferRoundedIcon sx={{ fontSize: 18 }} />
                  <span className="text-sm font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 text-xs border border-white/5 hover:border-white/10 transition-colors"
                    >
                      {tag}
                      {!isReadOnly && (
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-white ml-1 text-gray-500"
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))}
                  {!isReadOnly && (
                    <input
                      type="text"
                      className="bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-[100px] py-1"
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/5 w-full mb-8" />

              {/* BlockNote Editor */}
              <div className="editor-wrapper min-h-[500px]">
                <BlockNoteView
                  editor={editor}
                  editable={!isReadOnly}
                  theme="dark"
                />
              </div>
            </div>
          </div>
          {/* Bottom spacer */}
          <div className="h-10"></div>
        </div>
        {/* AI Review Bar */}
        {isReviewingAI && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-[#1e293b] border border-white/10 rounded-full shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="px-3 text-xs font-medium text-emerald-400 flex items-center gap-2">
              <AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />
              <span>AI Changes Applied</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <button
              onClick={handleDiscardAI}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={() => setIsPreviewAIOpen(true)}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-sky-400 hover:bg-sky-500/10 transition-colors"
            >
              Diff View
            </button>
            <button
              onClick={() => setIsReviewingAI(false)}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Keep
            </button>
          </div>
        )}
      </main>

      {/* AI Modals */}
      <AskAIModal
        isOpen={isAskAIOpen}
        onClose={() => setIsAskAIOpen(false)}
        onGenerate={handleGenerateAI}
        isGenerating={isGeneratingAI}
        hasSelection={!!aiContext} // Allow rewrite/fix if ANY context exists (selection or full doc)
      />

      <AIPreviewModal
        isOpen={isPreviewAIOpen}
        onClose={() => {
          handleDiscardAI();
          setIsPreviewAIOpen(false);
        }}
        onAccept={() => {
          setIsPreviewAIOpen(false);
          // Changes are already applied, just close modal
        }}
        originalText={aiContext}
        generatedText={aiResult}
        isReplacing={aiMode !== "generate"}
      />

    </div >
  );
}

export default Editor;
