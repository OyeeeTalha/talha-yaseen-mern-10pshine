import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layouts/Sidebar";
import NoteCard from "@/components/layouts/NoteCard";
import { getGreeting } from "@/lib/utils";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import {
  useCreateNote,
  useGetAllNotes,
  useDeleteNote,
  usePinNote,
  useUnpinNote,
} from "@/hooks/useNotes";
import { useGetCategories } from "@/hooks/useCategories";
import { useGetProfile } from "@/hooks/useUser";
import Loading from "@/components/ui/loading";
import { formatDate } from "@/lib/utils";

// Helper function to format date

function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState("All Notes");
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Load view mode from localStorage or default to "grid"
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const saved = localStorage.getItem("notesViewMode");
    return (saved as "grid" | "list") || "grid";
  });
  const navigate = useNavigate();

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("notesViewMode", viewMode);
  }, [viewMode]);

  // Hooks
  const { data: notes = [], isLoading } = useGetAllNotes();
  const { data: profileData } = useGetProfile();
  useGetCategories(); // Prefetch categories for sidebar
  const { mutate: createNote, isPending } = useCreateNote();
  const { mutate: deleteNote } = useDeleteNote();
  const { mutate: pinNote } = usePinNote();
  const { mutate: unpinNote } = useUnpinNote();

  // Get user's display name or first name, fallback to name or "User"
  const userName =
    profileData?.data?.user?.displayName ||
    profileData?.data?.user?.firstName ||
    profileData?.data?.user?.name?.split(" ")[0] ||
    "User";

  const handleCreateNote = () => {
    createNote(
      { title: "Untitled" },
      {
        onSuccess: (data) => {
          if (data?.data?.note?._id) {
            navigate(`/editor/${data.data.note._id}`);
          }
        },
      },
    );
  };

  const handleNoteClick = (noteId?: string) => {
    if (noteId) {
      navigate(`/editor/${noteId}`);
    }
  };

  const handlePinToggle = (noteId: string | undefined, isPinned: boolean) => {
    if (!noteId) return;
    if (isPinned) {
      unpinNote(noteId);
    } else {
      pinNote(noteId);
    }
  };

  const handleDelete = (noteId: string | undefined) => {
    if (!noteId) return;
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(noteId);
    }
  };

  // Filter and search logic
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Category filter
    if (selectedCategory === "All Notes") {
      return filtered.filter((n) => !n.isDeleted && !n.isTrash);
    } else if (selectedCategory === "Favorites") {
      return filtered.filter((n) => n.isPinned && !n.isDeleted && !n.isTrash);
    } else if (selectedCategory === "Trash") {
      return filtered.filter((n) => n.isTrash || n.isDeleted);
    } else if (selectedCategory === "Recent") {
      return filtered
        .filter((n) => !n.isDeleted && !n.isTrash)
        .sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 10);
    } else {
      // Category filter - filter by categoryName from backend
      return filtered.filter(
        (n) =>
          n.categoryName === selectedCategory && !n.isDeleted && !n.isTrash,
      );
    }
  }, [notes, selectedCategory, searchQuery]);

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  const displayedPinnedNotes = isPinnedExpanded
    ? pinnedNotes
    : pinnedNotes.slice(0, 3);

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden font-poppins">
      <Sidebar
        activeItem={selectedCategory}
        onItemClick={setSelectedCategory}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 w-full flex items-center justify-between px-8 border-b border-white/5 shrink-0">
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-semibold text-white">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Capture your ideas</p>
          </div>
          <div className="relative w-[320px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchRoundedIcon sx={{ fontSize: 22 }} />
            </div>
            <input
              type="text"
              placeholder="Search your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b] text-sm text-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder-gray-500 border border-transparent"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            {/* Pinned Section */}
            {selectedCategory !== "Trash" && pinnedNotes.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="flex items-center justify-center text-primary ">
                      <PushPinRoundedIcon sx={{ fontSize: 22 }} />
                    </div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider">
                      Pinned
                    </h3>
                  </div>
                  {pinnedNotes.length > 3 && (
                    <button
                      onClick={() => setIsPinnedExpanded(!isPinnedExpanded)}
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {isPinnedExpanded ? "View less" : "View all"}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedPinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      title={note.title}
                      content={note.content || ""}
                      date={formatDate(note.updatedAt || note.createdAt)}
                      isPinned={note.isPinned || false}
                      categoryId={note.category}
                      categoryName={note.categoryName}
                      categoryIndex={note.categoryIndex}
                      onPinClick={() =>
                        handlePinToggle(note._id, note.isPinned || false)
                      }
                      onDelete={() => handleDelete(note._id)}
                      onClick={() => handleNoteClick(note._id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Main Notes Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-white">
                  <h2 className="text-xl font-bold">{selectedCategory}</h2>
                  <span className="text-sm text-gray-500 font-medium ml-1">
                    ({otherNotes.length})
                  </span>
                </div>

                {/* View Toggle Buttons */}
                {otherNotes.length > 0 && (
                  <div className="flex items-center gap-0.5 bg-gray-800/50 rounded-md p-0.5 border border-white/5">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded transition-all ${
                        viewMode === "grid"
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                      title="Grid View"
                    >
                      <GridViewRoundedIcon sx={{ fontSize: 18 }} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded transition-all ${
                        viewMode === "list"
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                      title="List View"
                    >
                      <ViewListRoundedIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                )}
              </div>

              {selectedCategory === "Trash" ? (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                    <DeleteRoundedIcon
                      className="text-gray-600"
                      sx={{ fontSize: 32 }}
                    />
                  </div>
                  <h3 className="text-gray-300 font-medium">Trash is empty</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Deleted notes will appear here
                  </p>
                </div>
              ) : otherNotes.length > 0 ? (
                <>
                  {/* List View Headers */}
                  {viewMode === "list" && (
                    <div className="flex items-center gap-6 px-6 py-3 mb-2 border-b border-white/5">
                      <div className="w-48 shrink-0">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Title
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 px-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Snippet
                        </span>
                      </div>
                      <div className="w-32 shrink-0">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Categories
                        </span>
                      </div>
                      <div className="w-24 shrink-0 text-right">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Last Edited
                        </span>
                      </div>
                      <div className="w-8 shrink-0"></div>
                    </div>
                  )}

                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        : "flex flex-col gap-2"
                    }
                  >
                    {otherNotes.map((note) => (
                      <NoteCard
                        key={note._id}
                        title={note.title}
                        content={note.content || ""}
                        date={formatDate(note.updatedAt || note.createdAt)}
                        isPinned={note.isPinned || false}
                        categoryId={note.category}
                        categoryName={note.categoryName}
                        categoryIndex={note.categoryIndex}
                        viewMode={viewMode}
                        onPinClick={() =>
                          handlePinToggle(note._id, note.isPinned || false)
                        }
                        onDelete={() => handleDelete(note._id)}
                        onClick={() => handleNoteClick(note._id)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                    <DescriptionRoundedIcon
                      className="text-gray-600"
                      sx={{ fontSize: 32 }}
                    />
                  </div>
                  <h3 className="text-gray-300 font-medium">No notes found</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchQuery
                      ? "Try a different search term"
                      : "Create a new note to get started"}
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={handleCreateNote}
          disabled={isPending}
          className="absolute bottom-8 right-8 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-2 font-medium transition-all hover:scale-105 active:scale-95 group z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AddRoundedIcon sx={{ fontSize: 24 }} />
          <span>{isPending ? "Creating..." : "New Note"}</span>
        </button>
      </main>
    </div>
  );
}

export default Dashboard;
