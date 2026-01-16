import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

// Mock Database Data
const MOCK_DB_NOTE = {
  id: "note-123",
  title: "Project Phoenix Specs",
  category: "Work",
  tags: ["Urgent", "Specs", "Q1"],
  content: [
    {
      type: "heading",
      content: "Project Phoenix Specifications",
    },
    {
      type: "paragraph",
      content: "This is a loaded note from the database.",
    },
    {
      type: "bulletListItem",
      content: "Feature A: Dark Mode",
    },
    {
      type: "bulletListItem",
      content: "Feature B: Cloud Sync",
    },
  ],
};

type NoteData = {
  title: string;
  category: string;
  tags: string[];
  content: any[]; // BlockNote blocks
};

function Editor() {
  const { noteId } = useParams<{ noteId: string }>();
  const [title, setTitle] = useState("Untitled Note");
  const [selectedCategory, setSelectedCategory] = useState("Personal");
  const [categories, setCategories] = useState([
    "Personal",
    "Work",
    "Ideas",
    "Projects",
  ]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [activeSidebarItem, setActiveSidebarItem] = useState("All Notes");

  // Initialize BlockNote editor
  const editor = useCreateBlockNote();

  // Load Note Data (Simulate Fetch)
  useEffect(() => {
    if (noteId) {
      // In a real app, this would be:
      // const data = await fetch(`/api/notes/${noteId}`).then(res => res.json());

      console.log(`Fetching note with ID: ${noteId}`);

      // Simulating API response delay
      setTimeout(() => {
        const data = MOCK_DB_NOTE; // Using mock data

        setTitle(data.title);
        setSelectedCategory(data.category);
        setTags(data.tags);

        // Load content into BlockNote
        if (editor) {
          editor.replaceBlocks(editor.document, data.content as any);
        }
      }, 500);
    }
  }, [noteId, editor]);

  // Save Function
  const handleSave = async () => {
    const noteData: NoteData = {
      title,
      category: selectedCategory,
      tags,
      content: editor.document, // Get all blocks from editor
    };

    console.log("Saving Note Payload:", JSON.stringify(noteData, null, 2));

    // In a real app:
    // await fetch('/api/notes', { method: 'POST', body: JSON.stringify(noteData) });
    alert("Note saved! Check console for payload.");
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
      !categories.includes(newCategoryInput.trim())
    ) {
      setCategories([...categories, newCategoryInput.trim()]);
      setSelectedCategory(newCategoryInput.trim());
      setNewCategoryInput("");
      setIsCategoryDropdownOpen(false);
    }
  };

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
            <Button className="text-gray-400 hover:text-white transition-colors">
              <ArrowBackRoundedIcon />
            </Button>
            <span className="text-sm text-gray-500">Last edited just now</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full text-sm font-medium transition-all"
            >
              <SaveRoundedIcon sx={{ fontSize: 18 }} />
              <span>Save</span>
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
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-white/10 hover:bg-white/5 text-gray-300 transition-all min-w-[140px] justify-between"
                    >
                      <span>{selectedCategory}</span>
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
                            {categories.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setIsCategoryDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                                  selectedCategory === cat
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-300 hover:bg-white/5"
                                }`}
                              >
                                {cat}
                                {selectedCategory === cat && (
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
