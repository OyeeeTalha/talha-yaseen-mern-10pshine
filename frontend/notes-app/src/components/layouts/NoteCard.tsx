import { useState, useRef, useEffect } from "react";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import { getDeterministicColor } from "@/lib/utils";

type NoteCardProps = {
  title: string;
  content: string;
  date: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  categoryId?: string | null;
  categoryName?: string;
  categoryIndex?: number | null; // For color generation
  viewMode?: "grid" | "list"; // New prop for view mode
  onPinClick?: () => void;
  onFavoriteClick?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
};

function NoteCard(props: NoteCardProps) {
  const {
    title,
    content,
    date,
    isPinned,
    isFavorite,
    categoryId,
    categoryName,
    categoryIndex,
    viewMode = "grid", // Default to grid view
    onPinClick,
    onFavoriteClick,
    onDelete,
    onClick,
  } = props;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

          {/* Snippet - Flexible column */}
          <div className="flex-1 min-w-0 px-4">
            <p className="text-gray-400 text-sm truncate">
              {displayContent || "No content"}
            </p>
          </div>

          {/* Category - Fixed width column */}
          <div className="w-32 shrink-0">
            {categoryName &&
            categoryId !== null &&
            categoryId !== undefined &&
            categoryName.toLowerCase() !== "void" &&
            categoryIndex !== null &&
            categoryIndex !== undefined ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border"
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
                <span className="truncate">{categoryName}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-700/40 bg-gray-800/30 text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                <span className="truncate">Void</span>
              </span>
            )}
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
              <span>Delete</span>
            </button>
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
          </div>
          <span className="text-xs text-gray-500 shrink-0">{date}</span>
        </div>
      </div>

      {/* Dropdown Menu - Outside overflow container */}
      {showMenu && (
        <div
          ref={dropdownRef}
          className="absolute top-12 right-5 w-40 bg-gray-800 border border-white/10 rounded-lg shadow-xl shadow-black/50 z-9999"
          onClick={(e) => e.stopPropagation()}
        >
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
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default NoteCard;
