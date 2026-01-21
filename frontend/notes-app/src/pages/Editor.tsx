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

function Editor() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [activeSidebarItem, setActiveSidebarItem] = useState("All Notes");
  const [isSaving, setIsSaving] = useState(false);

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
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
          alert("Note saved successfully!");
        },
        onError: (error) => {
          setIsSaving(false);
          alert(`Failed to save note: ${error.message}`);
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
      createCategory.mutate(
        { name: newCategoryInput.trim() },
        {
          onSuccess: (response) => {
            setSelectedCategoryId(response.data.category.id);
            setNewCategoryInput("");
            setIsCategoryDropdownOpen(false);
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
                                setSelectedCategoryId(null);
                                setIsCategoryDropdownOpen(false);
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
                            {categories.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  setSelectedCategoryId(cat.id);
                                  setIsCategoryDropdownOpen(false);
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
      `}</style>
    </div>
  );
}

export default Editor;
