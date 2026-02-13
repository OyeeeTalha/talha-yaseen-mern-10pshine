import { useState, useRef, useEffect } from "react";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import RestoreFromTrashRoundedIcon from "@mui/icons-material/RestoreFromTrashRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import { getDeterministicColor, calculateTimeRemaining, getAvatarUrl } from "@/lib/utils";

type Collaborator = {
  userId: string;
  name?: string;
  email?: string;
  image?: string;
  avatarBgColor?: string;
  accessLevel?: "readonly" | "edit";
};

type Editor = {
  userId: string;
  name?: string;
  email?: string;
  image?: string;
  avatarBgColor?: string;
  lastEditedAt?: string | Date;
};

type NoteCardProps = {
  title: string;
  content: string;
  date: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  isTrash?: boolean;
  trashedAt?: number | null;
  expireAt?: string | null;
  categoryId?: string | null;
  categoryName?: string;
  categoryIndex?: number | null; // For color generation
  viewMode?: "grid" | "list"; // New prop for view mode
  sharedWith?: Collaborator[]; // Collaborators for sharing info
  editors?: Editor[]; // Users who have edited the note
  isOwner?: boolean; // Whether the current user is the owner
  onPinClick?: () => void;
  onFavoriteClick?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
  onAutoDelete?: () => void; // For automatic deletion without confirmation
  onShareClick?: () => void; // Share button callback
  onClick?: () => void;
};

function NoteCard(props: NoteCardProps) {
  const {
    title,
    content,
    date,
    isPinned,
    isFavorite,
    isTrash,
    trashedAt,
    expireAt,
    categoryId,
    categoryName,
    categoryIndex,
    viewMode = "grid", // Default to grid view
    editors = [], // Users who have edited the note
    isOwner = true, // Default to true for backward compatibility
    onPinClick,
    onFavoriteClick,
    onRestore,
    onDelete,
    onAutoDelete,
    onShareClick,
    onClick,
  } = props;
  const [showMenu, setShowMenu] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Avatar colors for editors
  const avatarColors = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#6366f1", // indigo
  ];

  // Get initials from name or email
  const getInitials = (name?: string, email?: string): string => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "??";
  };

  // Get color for editor based on index
  const getAvatarColor = (index: number): string => {
    return avatarColors[index % avatarColors.length];
  };

  // Check if image is a valid URL (not a preset avatar name)
  const isValidImageUrl = (image?: string): boolean => {
    if (!image) return false;
    return (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:") ||
      image.startsWith("/")
    );
  };

  // Editor avatars component - shows users who have edited the note
  const EditorAvatars = () => {
    if (editors.length === 0) return null;

    const displayedEditors = editors.slice(0, 3);
    const remaining = editors.length - 3;

    return (
      <div className="flex items-center -space-x-2">
        {displayedEditors.map((editor, index) => (
          <div
            key={editor.userId}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white border-2 border-gray-800"
            style={{ backgroundColor: editor.avatarBgColor || getAvatarColor(index) }}
            title={editor.name || editor.email || "Editor"}
          >
            {isValidImageUrl(getAvatarUrl(editor.image || "")) ? (
              <img
                src={getAvatarUrl(editor.image || "")}
                alt={editor.name || ""}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(editor.name, editor.email)
            )}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-gray-300 bg-gray-700 border-2 border-gray-800"
            title={`+${remaining} more editors`}
          >
            +{remaining}
          </div>
        )}
      </div>
    );
  };

  // Update timer for trashed notes
  useEffect(() => {
    if (isTrash && expireAt) {
      const updateTimer = () => {
        const { formattedTime, isExpired } = calculateTimeRemaining(expireAt);
        setTimeRemaining(formattedTime);

        // Auto-delete when expired (without confirmation)
        if (isExpired) {
          onAutoDelete?.();
        }
      };

      updateTimer(); // Initial update
      const interval = setInterval(updateTimer, 1000); // Update every second

      return () => clearInterval(interval);
    }
  }, [isTrash, expireAt, onAutoDelete]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract text content from note (handles BlockNote JSON)
  const getTextContent = (content: string): string => {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed
          .map((block: { content?: Array<{ text?: string }> }) => {
            if (block.content) {
              return Array.isArray(block.content)
                ? block.content
                  .map((c: { text?: string }) => c.text || "")
                  .join("")
                : "";
            }
            return "";
          })
          .join(" ")
          .trim();
      }
      return content;
    } catch {
      return content;
    }
  };

  const displayContent = getTextContent(content);

  // List view rendering
  if (viewMode === "list") {
    return (
      <div className="w-full relative">
        <div
          className="group flex items-center gap-6 px-6 py-4 rounded-lg bg-gray-800/30 border border-white/5 hover:border-primary/30 hover:bg-gray-800/50 transition-all cursor-pointer"
          onClick={(e) => {
            if (
              menuRef.current?.contains(e.target as Node) ||
              dropdownRef.current?.contains(e.target as Node)
            ) {
              return;
            }
            onClick?.();
          }}
        >
          {/* Title - Fixed width column */}
          <div className="w-48 shrink-0">
            <h4 className="text-white font-medium text-sm truncate">{title}</h4>
          </div>

          {/* Snippet - Flexible but constrained column */}
          <div className="flex-1 min-w-0 px-4">
            <p className="text-gray-400 text-sm truncate">
              {displayContent || "No content"}
            </p>
          </div>

          {/* Category - Fixed width column with truncation */}
          <div className="w-32 shrink-0 overflow-hidden">
            {categoryName &&
              categoryId !== null &&
              categoryId !== undefined &&
              categoryName.toLowerCase() !== "void" &&
              categoryIndex !== null &&
              categoryIndex !== undefined ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border max-w-full"
                style={{
                  backgroundColor: `${getDeterministicColor(categoryIndex)}15`,
                  borderColor: `${getDeterministicColor(categoryIndex)}40`,
                  color: getDeterministicColor(categoryIndex),
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: getDeterministicColor(categoryIndex),
                  }}
                ></span>
                <span className="truncate">{categoryName}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-700/40 bg-gray-800/30 text-gray-500 max-w-full">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0"></span>
                <span className="truncate">Void</span>
              </span>
            )}
          </div>

          {/* Editors - Fixed width column */}
          <div className="w-24 shrink-0">
            <EditorAvatars />
          </div>

          {/* Last Edited - Fixed width column */}
          <div className="w-24 shrink-0 text-right">
            <span className="text-xs text-gray-500">{date}</span>
          </div>

          {/* Menu Button */}
          <div className="shrink-0" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
            >
              <MoreHorizRoundedIcon sx={{ fontSize: 20 }} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            ref={dropdownRef}
            className="absolute top-12 right-5 w-40 bg-gray-800 border border-white/10 rounded-lg shadow-xl shadow-black/50 z-9999"
            onClick={(e) => e.stopPropagation()}
          >
            {isTrash ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore?.();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors"
                >
                  <RestoreFromTrashRoundedIcon sx={{ fontSize: 18 }} />
                  <span>Restore</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <DeleteForeverRoundedIcon sx={{ fontSize: 18 }} />
                  <span>Permanent</span>
                </button>
              </>
            ) : (
              <>
                {isOwner && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareClick?.();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <ShareRoundedIcon sx={{ fontSize: 18 }} />
                    <span>Share</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinClick?.();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                >
                  <PushPinRoundedIcon sx={{ fontSize: 18 }} />
                  <span>{isPinned ? "Unpin" : "Pin"}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavoriteClick?.();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                >
                  {isFavorite ? (
                    <StarRoundedIcon sx={{ fontSize: 18, color: "#fbbf24" }} />
                  ) : (
                    <StarBorderRoundedIcon sx={{ fontSize: 18 }} />
                  )}
                  <span>{isFavorite ? "Unfavorite" : "Favorite"}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <DeleteRoundedIcon sx={{ fontSize: 18 }} />
                  <span>Move to Trash</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Grid view rendering (original)
  return (
    <div className="w-full relative">
      <div
        className="group flex flex-col p-5 h-54 rounded-2xl bg-gray-800/50 border border-white/5 hover:border-primary/30 hover:shadow-lg hover:shadow-black/20 transition-all cursor-pointer"
        onClick={(e) => {
          // Don't navigate if clicking inside the menu area or dropdown
          if (
            menuRef.current?.contains(e.target as Node) ||
            dropdownRef.current?.contains(e.target as Node)
          ) {
            return;
          }
          onClick?.();
        }}
      >
        {/* Content Section - Made clickable */}
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h4 className="text-white font-semibold text-lg truncate flex-1">
              {title}
            </h4>

            {/* Three Dots Menu Button */}
            <div className="shrink-0" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 z-50"
              >
                <MoreHorizRoundedIcon sx={{ fontSize: 24 }} />
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed wrap-break-word">
            {displayContent || "No content"}
          </p>
        </div>

        {/* Footer Section - Fixed at bottom */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <div className="flex gap-2 flex-wrap items-center">
            {/* Timer for trashed notes */}
            {isTrash && trashedAt ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-red-700/40 bg-red-800/20 text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Deletes in {timeRemaining}
              </span>
            ) : (
              <>
                {/* Category Badge */}
                {categoryName &&
                  categoryId !== null &&
                  categoryId !== undefined &&
                  categoryName.toLowerCase() !== "void" &&
                  categoryIndex !== null &&
                  categoryIndex !== undefined ? (
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border"
                    style={{
                      backgroundColor: `${getDeterministicColor(categoryIndex)}15`,
                      borderColor: `${getDeterministicColor(categoryIndex)}40`,
                      color: getDeterministicColor(categoryIndex),
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: getDeterministicColor(categoryIndex),
                      }}
                    ></span>
                    {categoryName}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-700/40 bg-gray-800/30 text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                    Void
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <EditorAvatars />
            <span className="text-xs text-gray-500 shrink-0">{date}</span>
          </div>
        </div>
      </div>

      {/* Dropdown Menu - Outside overflow container */}
      {showMenu && (
        <div
          ref={dropdownRef}
          className="absolute top-12 right-5 w-40 bg-gray-800 border border-white/10 rounded-lg shadow-xl shadow-black/50 z-9999"
          onClick={(e) => e.stopPropagation()}
        >
          {isTrash ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore?.();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <RestoreFromTrashRoundedIcon sx={{ fontSize: 18 }} />
                <span>Restore</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <DeleteForeverRoundedIcon sx={{ fontSize: 18 }} />
                <span>Permanent</span>
              </button>
            </>
          ) : (
            <>
              {isOwner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareClick?.();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                >
                  <ShareRoundedIcon sx={{ fontSize: 18 }} />
                  <span>Share</span>
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPinClick?.();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
              >
                <PushPinRoundedIcon sx={{ fontSize: 18 }} />
                <span>{isPinned ? "Unpin" : "Pin"}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteClick?.();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
              >
                {isFavorite ? (
                  <StarRoundedIcon sx={{ fontSize: 18, color: "#fbbf24" }} />
                ) : (
                  <StarBorderRoundedIcon sx={{ fontSize: 18 }} />
                )}
                <span>{isFavorite ? "Unfavorite" : "Favorite"}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <DeleteRoundedIcon sx={{ fontSize: 18 }} />
                <span>Move to Trash</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default NoteCard;
