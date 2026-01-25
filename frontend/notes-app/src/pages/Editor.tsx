import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn"; // Using shadcn interface
import "@blocknote/shadcn/style.css";
import Sidebar from "@/components/layouts/Sidebar";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button } from "@/components/ui/button";
import { useGetNoteById, useUpdateNote } from "@/hooks/useNotes";
import { useGetCategories, useCreateCategory } from "@/hooks/useCategories";
import Loading from "@/components/ui/loading";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";

function Editor() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [activeSidebarItem, setActiveSidebarItem] = useState("All Notes");
  const [isSaving, setIsSaving] = useState(false);

  // Toast hook
  const { toasts, hideToast, success, error: showError } = useToast();

  // Hooks
  const { data: noteData, isLoading: isLoadingNote } = useGetNoteById(
    noteId || "",
  );

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

  // Parse note content once - memoize based on content string to avoid re-parsing
  const parsedContent = useMemo(() => {
    if (noteData?.content) {
      try {
        return JSON.parse(noteData.content);
      } catch (error) {
        console.error("Failed to parse note content:", error);
        return undefined;
      }
    }
    return undefined;
  }, [noteData?.content]); // Only re-parse when content string changes

  // Initialize BlockNote editor
  const editor = useCreateBlockNote();

  // Load content into editor when note changes
  useEffect(() => {
    if (editor && parsedContent) {
      editor.replaceBlocks(editor.document, parsedContent);
    }
  }, [editor, parsedContent]);

  // Save Function
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

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Bar for specific note actions */}
        <header className="h-16 w-full flex items-center justify-between px-8 border-b border-white/5 shrink-0 bg-[#0d1117]">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/dashboard")}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowBackRoundedIcon />
            </Button>
            <span className="text-sm text-gray-500">
              {noteData?.updatedAt
                ? `Last edited ${new Date(noteData.updatedAt).toLocaleString()}`
                : "New note"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || updateNote.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveRoundedIcon sx={{ fontSize: 18 }} />
              <span>
                {isSaving || updateNote.isPending ? "Saving..." : "Save"}
              </span>
            </button>
          </div>
        </header>

        {/* Editor Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto px-8 py-10">
            {/* Note Meta (Title, Category, Tags) */}
            <div className="mb-8 space-y-6">
              {/* Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-4xl font-bold text-white placeholder-gray-600 border-none outline-none ring-0 p-0"
                placeholder="Note Title"
              />

              {/* Meta Controls */}
              <div className="flex flex-col gap-4">
                {/* Category Selector */}
                <div className="flex items-center gap-3 text-gray-400 group relative">
                  <div className="w-8 flex justify-center">
                    <CategoryRoundedIcon sx={{ fontSize: 20 }} />
                  </div>
                  <span className="text-sm w-20">Category</span>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                      }
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-white/10 hover:bg-white/5 text-gray-300 transition-all min-w-35 justify-between"
                    >
                      <span>{selectedCategoryName}</span>
                      <KeyboardArrowDownRoundedIcon
                        sx={{ fontSize: 18 }}
                        className={`transition-transform duration-200 ${
                          isCategoryDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isCategoryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-[#161b22] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-1">
                          <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {/* Void option */}
                            <button
                              onClick={() => {
                                const newCategoryId = null;
                                setSelectedCategoryId(newCategoryId);
                                setIsCategoryDropdownOpen(false);

                                // Optimistically update the note's category
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
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                                selectedCategoryId === null
                                  ? "bg-primary/10 text-primary"
                                  : "text-gray-300 hover:bg-white/5"
                              }`}
                            >
                              Void
                              {selectedCategoryId === null && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              )}
                            </button>
                            {/* Filter out Void category from the list */}
                            {categories
                              .filter(
                                (cat) => cat.name.toLowerCase() !== "void",
                              )
                              .map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    const newCategoryId = cat.id;
                                    setSelectedCategoryId(newCategoryId);
                                    setIsCategoryDropdownOpen(false);

                                    // Optimistically update the note's category
                                    if (noteId) {
                                      updateNote.mutate({
                                        id: noteId,
                                        data: {
                                          title,
                                          category: newCategoryId,
                                          tags,
                                          content: JSON.stringify(
                                            editor.document,
                                          ),
                                        },
                                      });
                                    }
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                                    selectedCategoryId === cat.id
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
                  </div>

                  {/* Overlay to close dropdown when clicking outside */}
                  {isCategoryDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    />
                  )}
                </div>

                {/* Tags Input */}
                <div className="flex items-start gap-3 text-gray-400 group">
                  <div className="w-8 flex justify-center mt-1.5">
                    <LocalOfferRoundedIcon sx={{ fontSize: 20 }} />
                  </div>
                  <span className="text-sm w-20 mt-1.5 ">Tags</span>
                  <div className="flex-1 flex flex-wrap items-center gap-2 min-h-8">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 text-xs border border-white/5 group-hover:border-white/10"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-white ml-1"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="bg-transparent text-sm text-white placeholder-gray-600 outline-none min-w-30"
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BlockNote Editor */}
            <div className="editor-wrapper min-h-125">
              <BlockNoteView
                editor={editor}
                theme={"dark"}
                className="min-h-screen text-white"
              />
            </div>
          </div>
        </div>
      </main>

      <style>{`
        /* Overriding BlockNote Dark Theme variables manually if needed to match App bg */
        .bn-editor {
          background-color: transparent !important;
        }
        .bn-block-content {
           color: #e2e8f0; /* text-slate-200 */
        }

        /* ===== UNIVERSAL BLOCKNOTE OVERLAY FIX ===== */
        /* AGGRESSIVE: Target EVERYTHING that could be a popup/overlay */
        
        /* Catch-all for any div that appears over content */
        .bn-container div[style*="position: absolute"],
        .bn-container div[style*="position: fixed"],
        .bn-container div[data-radix-portal],
        .bn-container [data-radix-popper-content-wrapper],
        .bn-container [data-radix-popper-content-wrapper] > *,
        .bn-container div[role="dialog"],
        .bn-container div[role="menu"],
        .bn-container div[role="listbox"],
        .bn-container div[role="tooltip"] {
          background: #1a1f2e !important;
          background-color: #1a1f2e !important;
        }

        /* Main menu containers */
        .bn-container [class*="mantine-Menu"],
        .bn-container [class*="mantine-Menu"] *,
        .bn-container .mantine-Menu-dropdown,
        .bn-container [class*="SuggestionMenu"],
        .bn-container [class*="FormattingToolbar"],
        .bn-container [class*="LinkToolbar"],
        .bn-container [class*="TableHandles"],
        .bn-container [class*="mantine-Popover"],
        .bn-container [class*="mantine-Popover-dropdown"],
        .bn-container [class*="mantine-Modal"],
        .bn-container [class*="mantine-Modal-content"],
        .bn-container [class*="mantine-Paper"],
        .bn-container [role="menu"],
        .bn-container [role="dialog"],
        .bn-shadcn-suggestion-menu,
        .bn-shadcn-suggestion-menu-wrapper,
        [data-suggestion-menu],
        [data-radix-popper-content-wrapper] {
          background: #1a1f2e !important;
          background-color: #1a1f2e !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8) !important;
          z-index: 9999 !important;
          opacity: 1 !important;
          backdrop-filter: none !important;
        }

        /* Modal body and header specific styling */
        .bn-container [class*="mantine-Modal-body"] {
          padding: 24px !important;
          background-color: #1a1f2e !important;
        }

        .bn-container [class*="mantine-Modal-header"] {
          padding: 20px 24px !important;
          background-color: #1a1f2e !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }

        /* Target ALL possible panel and form wrappers */
        .bn-container > div > div > div,
        .bn-container form,
        .bn-container fieldset {
          background-color: inherit !important;
        }

        /* All nested elements inherit solid background */
        .bn-container .mantine-Menu-dropdown > *,
        .bn-container .mantine-Menu-dropdown *,
        .bn-container [class*="SuggestionMenu"] > *,
        .bn-container [class*="SuggestionMenu"] *,
        .bn-container [class*="SuggestionMenu-root"],
        .bn-container [class*="mantine-Modal-body"],
        .bn-container [class*="mantine-Modal-header"],
        .bn-container [class*="mantine-Popover-dropdown"] > * {
          background: inherit !important;
          opacity: 1 !important;
        }

        /* Menu items */
        .bn-container .mantine-Menu-item,
        .bn-container [class*="SuggestionMenu"] [class*="item"],
        .bn-container [class*="SuggestionMenu"] button {
          color: #e2e8f0 !important;
          background-color: #1a1f2e !important;
          border-radius: 4px !important;
          padding: 8px 12px !important;
        }

        /* Hover states */
        .bn-container .mantine-Menu-item:hover,
        .bn-container [class*="SuggestionMenu"] [class*="item"]:hover,
        .bn-container [class*="SuggestionMenu"] button:hover,
        .bn-container .mantine-Menu-item[data-hovered],
        .bn-container [class*="SuggestionMenu"] [class*="item"][data-selected],
        .bn-container [class*="SuggestionMenu"] button[data-selected] {
          background-color: rgba(59, 130, 246, 0.3) !important;
          color: #60a5fa !important;
        }

        /* Labels and headers */
        .bn-container .mantine-Menu-label {
          color: #9ca3af !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding: 8px 12px 4px !important;
          background-color: #1a1f2e !important;
        }

        .bn-container [class*="mantine-Modal-title"],
        .bn-container [class*="mantine-Popover"] h1,
        .bn-container [class*="mantine-Popover"] h2,
        .bn-container [class*="mantine-Popover"] h3 {
          color: #e2e8f0 !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          text-transform: none !important;
          letter-spacing: normal !important;
          padding: 0 !important;
          background-color: transparent !important;
          margin-bottom: 16px !important;
        }

        /* Dividers */
        .bn-container .mantine-Divider-root {
          border-color: rgba(255, 255, 255, 0.1) !important;
          background: transparent !important;
        }

        /* All popover and portal elements */
        .bn-container [class*="Popover"],
        .bn-container div[class*="suggestion"],
        .bn-container div[class*="Suggestion"],
        .bn-container div[class*="menu"],
        .bn-container div[class*="Menu"] {
          background: #1a1f2e !important;
          opacity: 1 !important;
        }

        /* Formatting Toolbar */
        .bn-container [class*="FormattingToolbar"] button,
        .bn-container [class*="LinkToolbar"] button {
          color: #e2e8f0 !important;
          background-color: #1a1f2e !important;
          border-radius: 4px !important;
        }

        .bn-container [class*="FormattingToolbar"] button:hover,
        .bn-container [class*="LinkToolbar"] button:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }

        .bn-container [class*="FormattingToolbar"] button[data-active="true"],
        .bn-container [class*="LinkToolbar"] button[data-active="true"] {
          background-color: rgba(59, 130, 246, 0.25) !important;
          color: #60a5fa !important;
        }

        /* Input fields in ALL menus and modals */
        .bn-container input,
        .bn-container input[type="text"],
        .bn-container input[type="url"],
        .bn-container input[type="number"],
        .bn-container input[type="file"],
        .bn-container textarea,
        .bn-container select,
        .bn-container [class*="mantine-Input"],
        .bn-container [class*="mantine-Textarea"],
        .bn-container [class*="mantine-Select"] {
          background-color: #0d1117 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #e2e8f0 !important;
          border-radius: 4px !important;
          padding: 8px 12px !important;
          font-size: 14px !important;
        }

        .bn-container input:focus,
        .bn-container input[type="text"]:focus,
        .bn-container input[type="url"]:focus,
        .bn-container input[type="number"]:focus,
        .bn-container textarea:focus,
        .bn-container select:focus,
        .bn-container [class*="mantine-Input"]:focus-within,
        .bn-container [class*="mantine-Textarea"]:focus-within,
        .bn-container [class*="mantine-Select"]:focus-within {
          border-color: #60a5fa !important;
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }

        /* Buttons in modals and popups - Remove aggressive override */
        .bn-container [class*="mantine-Button"],
        .bn-container [class*="mantine-Modal"] button:not([class*="mantine-Modal-close"]),
        .bn-container [class*="mantine-Popover"] button:not([class*="CloseButton"]) {
          background-color: transparent !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          color: #e2e8f0 !important;
          border-radius: 6px !important;
          padding: 8px 16px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: all 0.2s !important;
        }

        .bn-container [class*="mantine-Button"]:hover,
        .bn-container [class*="mantine-Modal"] button:not([class*="mantine-Modal-close"]):hover,
        .bn-container [class*="mantine-Popover"] button:not([class*="CloseButton"]):hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: #60a5fa !important;
        }

        .bn-container [class*="mantine-Button-filled"],
        .bn-container button[class*="mantine-Button"][data-variant="filled"],
        .bn-container button[data-primary="true"] {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: white !important;
        }

        .bn-container [class*="mantine-Button-filled"]:hover,
        .bn-container button[class*="mantine-Button"][data-variant="filled"]:hover,
        .bn-container button[data-primary="true"]:hover {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }

        /* Drag handle */
        .bn-container [class*="DragHandle"] {
          background-color: #374151 !important;
        }

        .bn-container [class*="DragHandle"]:hover {
          background-color: #4b5563 !important;
        }

        /* Side menu */
        .bn-container [class*="SideMenu"] {
          background-color: transparent !important;
        }

        /* Color picker */
        .bn-container [class*="ColorPicker"] {
          background-color: #1a1f2e !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        /* File upload and embed modals - ULTRA SPECIFIC */
        .bn-container [class*="FilePanel"],
        .bn-container [class*="EmbedPanel"],
        .bn-container [class*="ImagePanel"],
        .bn-container [class*="VideoPanel"],
        .bn-container [class*="AudioPanel"],
        .bn-container [class*="FileInput"],
        .bn-container [class*="UrlInput"],
        .bn-container [class*="file"],
        .bn-container [class*="File"],
        .bn-container [class*="embed"],
        .bn-container [class*="Embed"],
        .bn-container [class*="image"],
        .bn-container [class*="Image"],
        .bn-container [class*="upload"],
        .bn-container [class*="Upload"] {
          background: #1a1f2e !important;
          background-color: #1a1f2e !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px !important;
          padding: 16px !important;
        }

        /* Backdrop overlay styling */
        .bn-container [class*="overlay"],
        .bn-container [class*="Overlay"],
        .bn-container [class*="portal"],
        .bn-container [class*="Portal"],
        .bn-container [class*="mantine-Modal-overlay"],
        .bn-container [class*="backdrop"],
        .bn-container [class*="Backdrop"] {
          background: rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(4px) !important;
        }

        /* Ensure all text in overlays is visible */
        .bn-container [class*="mantine-Modal"] *,
        .bn-container [class*="mantine-Popover"] *,
        .bn-container [role="dialog"] *,
        .bn-container [data-radix-popper-content-wrapper] * {
          color: inherit !important;
        }

        .bn-container [class*="mantine-Text"],
        .bn-container label,
        .bn-container p,
        .bn-container span {
          color: #e2e8f0 !important;
        }

        /* Close buttons */
        .bn-container [class*="mantine-Modal-close"],
        .bn-container [class*="CloseButton"],
        .bn-container button[aria-label*="close"],
        .bn-container button[aria-label*="Close"] {
          color: #9ca3af !important;
          background-color: transparent !important;
        }

        .bn-container [class*="mantine-Modal-close"]:hover,
        .bn-container [class*="CloseButton"]:hover,
        .bn-container button[aria-label*="close"]:hover,
        .bn-container button[aria-label*="Close"]:hover {
          color: #e2e8f0 !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
        }

        /* Tabs if any */
        .bn-container [class*="mantine-Tabs"],
        .bn-container [role="tablist"] {
          background-color: #1a1f2e !important;
        }

        .bn-container [class*="mantine-Tabs-tab"],
        .bn-container [role="tab"] {
          color: #9ca3af !important;
          background-color: transparent !important;
        }

        .bn-container [class*="mantine-Tabs-tab"]:hover,
        .bn-container [role="tab"]:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }

        .bn-container [class*="mantine-Tabs-tab"][data-active="true"],
        .bn-container [role="tab"][aria-selected="true"] {
          color: #60a5fa !important;
          border-bottom-color: #60a5fa !important;
        }
      `}</style>
    </div>
  );
}

export default Editor;
