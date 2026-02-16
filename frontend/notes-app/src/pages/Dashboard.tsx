import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layouts/Sidebar";
import NoteCard from "@/components/layouts/NoteCard";
import { ShareNoteModal } from "@/components/ShareNoteModal";
import { getGreeting } from "@/lib/utils";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import {
  useCreateNote,
  useGetAllNotes,
  usePinNote,
  useUnpinNote,
  useFavoriteNote,
  useUnfavoriteNote,
  useTrashNote,
  useRestoreNote,
  usePermanentDeleteNote,
} from "@/hooks/useNotes";
import { useGetCategories } from "@/hooks/useCategories";
import { useGetProfile } from "@/hooks/useUser";
import Loading from "@/components/ui/loading";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { ToastContainer } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useGetDailyQuote } from "@/hooks/useAI";

function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState("All Notes");
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shareNoteId, setShareNoteId] = useState<string | null>(null);

  // Load view mode from localStorage or default to "grid"
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const saved = localStorage.getItem("notesViewMode");
    return (saved as "grid" | "list") || "grid";
  });

  const navigate = useNavigate();

  // Toast and Confirm hooks
  const { toasts, hideToast, success, error } = useToast();
  const { confirm, isOpen, options, handleConfirm, handleCancel } =
    useConfirm();

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("notesViewMode", viewMode);
  }, [viewMode]);

  // Fetch Daily Quote using custom hook
  const { data: dailyQuote, isLoading: isLoadingQuote } = useGetDailyQuote();

  // Hooks
  const { data: notes = [], isLoading } = useGetAllNotes();
  const { data: profileData } = useGetProfile();
  useGetCategories(); // Prefetch categories for sidebar
  const { mutate: createNote, isPending } = useCreateNote();

  const { mutate: pinNote } = usePinNote();
  const { mutate: unpinNote } = useUnpinNote();
  const { mutate: favoriteNote } = useFavoriteNote();
  const { mutate: unfavoriteNote } = useUnfavoriteNote();
  const { mutate: trashNote } = useTrashNote();
  const { mutate: restoreNote } = useRestoreNote();
  const { mutate: permanentDeleteNote } = usePermanentDeleteNote();


  // Get user's display name or first name, fallback to name or "User"
  const userName =
    profileData?.data?.user?.displayName ||
    profileData?.data?.user?.firstName ||
    profileData?.data?.user?.name?.split(" ")[0] ||
    "User";

  const currentUserId = profileData?.data?.user?._id;

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
      unpinNote(noteId, {
        onSuccess: () => success("Note unpinned"),
      });
    } else {
      pinNote(noteId, {
        onSuccess: () => success("Note pinned"),
      });
    }
  };

  const handleFavoriteToggle = (
    noteId: string | undefined,
    isFavorite: boolean,
  ) => {
    if (!noteId) return;
    if (isFavorite) {
      unfavoriteNote(noteId, {
        onSuccess: () => success("Removed from favorites"),
      });
    } else {
      favoriteNote(noteId, {
        onSuccess: () => success("Added to favorites"),
      });
    }
  };

  const handleTrash = (noteId: string | undefined) => {
    if (!noteId) return;
    trashNote(noteId, {
      onSuccess: () => success("Note moved to trash"),
    });
  };

  const handleRestore = (noteId: string | undefined) => {
    if (!noteId) return;
    restoreNote(noteId, {
      onSuccess: () => success("Note restored"),
    });
  };

  const handlePermanentDelete = async (noteId: string | undefined) => {
    if (!noteId) return;
    const confirmed = await confirm({
      title: "Delete this note?",
      message:
        "Are you sure you want to delete this note? This action cannot be undone and will be permanently removed from your library.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (confirmed) {
      permanentDeleteNote(noteId);
    }
  };

  const handleAutoPermanentDelete = (noteId: string | undefined) => {
    if (!noteId) return;
    permanentDeleteNote(noteId);
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
      const currentUserId = profileData?.data?.user?._id;
      return filtered.filter(
        (n) =>
          !n.isDeleted &&
          !n.isTrash &&
          (currentUserId ? n.userId === currentUserId : true),
      );
    } else if (selectedCategory === "Favorites") {
      return filtered.filter((n) => n.isFavorite && !n.isDeleted && !n.isTrash);
    } else if (selectedCategory === "Trash") {
      return filtered.filter((n) => n.isTrash || n.isDeleted);
    } else if (selectedCategory === "Shared") {
      const currentUserId = profileData?.data?.user?._id;
      return filtered.filter(
        (n) =>
          !n.isDeleted &&
          !n.isTrash &&
          currentUserId &&
          (n.userId !== currentUserId || // Shared with me (I am not owner)
            (n.sharedWith && n.sharedWith.length > 0) || // Shared by me and someone accessed it
            !!n.shareId) // Shared by me (link generated)
      );
    } else {
      // Category filter - filter by categoryName from backend
      return filtered.filter(
        (n) =>
          n.categoryName === selectedCategory && !n.isDeleted && !n.isTrash,
      );
    }
  }, [notes, selectedCategory, searchQuery, profileData]);

  const showPinnedSection =
    selectedCategory !== "Trash" && selectedCategory !== "Shared";
  const pinnedNotes = showPinnedSection
    ? filteredNotes.filter((n) => n.isPinned)
    : [];
  const otherNotes = showPinnedSection
    ? filteredNotes.filter((n) => !n.isPinned)
    : filteredNotes;

  const displayedPinnedNotes = isPinnedExpanded
    ? pinnedNotes
    : pinnedNotes.slice(0, 3);

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden font-poppins">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={hideToast} />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Share Note Modal */}
      {shareNoteId && (
        <ShareNoteModal
          noteId={shareNoteId}
          isOpen={!!shareNoteId}
          onClose={() => setShareNoteId(null)}
        />
      )}

      <Sidebar
        activeItem={selectedCategory}
        onItemClick={setSelectedCategory}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-24 w-full flex items-center justify-between px-8 border-b border-white/5 shrink-0 bg-[#0d1117]/80 backdrop-blur-xl z-50">

          {/* Left: Greeting & Integrated Quote */}
          <div className="flex flex-col justify-center gap-1.5 min-w-[300px]">
            <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              {getGreeting()}, <span className="opacity-90 capitalize">{userName}</span>
            </h1>

            <div className="flex items-center gap-2 h-5">
              {isLoadingQuote ? (
                <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
              ) : (
                <div className="flex items-center gap-2 group">
                  <AutoAwesomeRoundedIcon className="text-primary/70 text-[14px] animate-pulse" />
                  <p className="text-sm text-gray-400 font-medium tracking-wide bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 bg-[length:200%_auto] animate-shine bg-clip-text text-transparent truncate max-w-[500px]">
                    {dailyQuote || "Stay inspired today."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Search & Actions */}
          <div className="flex items-center gap-4">
            {/* Date Badge removed */}

            <div className="relative w-[240px] transition-all duration-300 focus-within:w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                <SearchRoundedIcon sx={{ fontSize: 20 }} />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161b22] text-sm text-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-gray-700 placeholder-gray-600 border border-transparent transition-all duration-200 hover:bg-[#1c2128]"
              />
            </div>
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
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center text-primary/80">
                      <PushPinRoundedIcon sx={{ fontSize: 16 }} />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      Pinned Notes
                    </h3>
                  </div>
                  {pinnedNotes.length > 3 && (
                    <button
                      onClick={() => setIsPinnedExpanded(!isPinnedExpanded)}
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {isPinnedExpanded ? "Show less" : "Show all"}
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
                      isFavorite={note.isFavorite || false}
                      isTrash={note.isTrash || false}
                      trashedAt={note.trashedAt}
                      expireAt={note.expireAt}
                      categoryId={note.category}
                      categoryName={note.categoryName}
                      categoryIndex={note.categoryIndex}
                      editors={note.editors}
                      isOwner={
                        currentUserId ? note.userId === currentUserId : false
                      }
                      onPinClick={() =>
                        handlePinToggle(note._id, note.isPinned || false)
                      }
                      onFavoriteClick={() =>
                        handleFavoriteToggle(note._id, note.isFavorite || false)
                      }
                      onShareClick={() => note._id && setShareNoteId(note._id)}
                      onRestore={() => handleRestore(note._id)}
                      onDelete={() => handleTrash(note._id)}
                      onAutoDelete={() => handleAutoPermanentDelete(note._id)}
                      onClick={() => handleNoteClick(note._id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Main Notes Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{selectedCategory}</h2>
                  <span className="text-xs font-medium text-gray-400 bg-white/5 px-2.5 py-1 rounded-full">
                    {otherNotes.length}
                  </span>
                </div>

                {/* View Toggle Buttons */}
                {otherNotes.length > 0 && (
                  <div className="flex items-center gap-1 p-1 bg-[#161b22] rounded-lg border border-white/5">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`flex items-center justify-center h-7 w-7 rounded-md transition-all duration-200 ${viewMode === "grid"
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      title="Grid View"
                    >
                      <GridViewRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex items-center justify-center h-7 w-7 rounded-md transition-all duration-200 ${viewMode === "list"
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      title="List View"
                    >
                      <ViewListRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                )}
              </div>

              {otherNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                  <div className="w-16 h-16 bg-[#161b22] rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                    {selectedCategory === "Trash" ? (
                      <DeleteRoundedIcon
                        className="text-gray-600"
                        sx={{ fontSize: 24 }}
                      />
                    ) : (
                      <DescriptionRoundedIcon
                        className="text-gray-600"
                        sx={{ fontSize: 24 }}
                      />
                    )}
                  </div>
                  <h3 className="text-gray-300 font-medium">
                    {selectedCategory === "Trash"
                      ? "Empty Trash"
                      : "No notes here"}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {selectedCategory === "Trash"
                      ? "Deleted items will show up here"
                      : "Create your first note to get started"}
                  </p>
                </div>
              ) : (
                <>
                  {/* List View Headers */}
                  {viewMode === "list" && (
                    <div className="flex items-center gap-6 px-6 py-3 mb-2 border-b border-white/5">
                      <div className="w-48 shrink-0">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Title
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 px-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Snippet
                        </span>
                      </div>
                      <div className="w-32 shrink-0">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Categories
                        </span>
                      </div>
                      <div className="w-24 shrink-0">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Editors
                        </span>
                      </div>
                      <div className="w-24 shrink-0">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {selectedCategory === "Trash" ? "Deletes In" : "Last Edited"}
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
                        isFavorite={note.isFavorite || false}
                        isTrash={note.isTrash || false}
                        trashedAt={note.trashedAt}
                        expireAt={note.expireAt}
                        categoryId={note.category}
                        categoryName={note.categoryName}
                        categoryIndex={note.categoryIndex}
                        viewMode={viewMode}
                        editors={note.editors}
                        isOwner={
                          currentUserId ? note.userId === currentUserId : false
                        }
                        onPinClick={() =>
                          handlePinToggle(note._id, note.isPinned || false)
                        }
                        onFavoriteClick={() =>
                          handleFavoriteToggle(
                            note._id,
                            note.isFavorite || false,
                          )
                        }
                        onShareClick={() => note._id && setShareNoteId(note._id)}
                        onRestore={() => handleRestore(note._id)}
                        onDelete={() =>
                          selectedCategory === "Trash"
                            ? handlePermanentDelete(note._id)
                            : handleTrash(note._id)
                        }
                        onAutoDelete={() => handleAutoPermanentDelete(note._id)}
                        onClick={() => handleNoteClick(note._id)}
                      />
                    ))}
                  </div>
                </>
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
