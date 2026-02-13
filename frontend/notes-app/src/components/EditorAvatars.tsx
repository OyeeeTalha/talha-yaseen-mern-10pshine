import { useState, useRef, useEffect } from "react";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import { getAvatarUrl } from "@/lib/utils";

type Editor = {
  userId: string;
  name?: string;
  email?: string;
  image?: string;
  avatarBgColor?: string;
  lastEditedAt?: string | Date;
};

interface EditorAvatarsProps {
  editors: Editor[];
  currentUserId?: string;
}

export function EditorAvatars({ editors, currentUserId }: EditorAvatarsProps) {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Avatar colors for fallback
  const avatarColors = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1",
  ];

  const getAvatarColor = (index: number) => {
    return avatarColors[index % avatarColors.length];
  };

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

  const isValidImageUrl = (image?: string): boolean => {
    if (!image) return false;
    return (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:") ||
      image.startsWith("/")
    );
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showModal]);

  if (editors.length === 0) return null;

  // Reverse order so most recent editors appear first
  const displayedEditors = [...editors].reverse().slice(0, 3);
  const remaining = editors.length - 3;

  return (
    <div className="relative">
      <button
        onClick={() => setShowModal(!showModal)}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 text-gray-300 hover:bg-white/10 rounded-full text-sm font-medium transition-all border border-white/5 hover:border-white/10"
      >
        <div className="flex items-center -space-x-2">
          {displayedEditors.map((editor, index) => (
            <div
              key={editor.userId}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white border-2 border-[#0d1117]"
              style={{
                backgroundColor: editor.avatarBgColor || getAvatarColor(index),
              }}
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
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-gray-300 bg-gray-700 border-2 border-[#0d1117]"
              title={`+${remaining} more`}
            >
              +{remaining}
            </div>
          )}
        </div>
        <PeopleRoundedIcon sx={{ fontSize: 16 }} />
      </button>

      {/* Modal/Popover */}
      {showModal && (
        <div
          ref={modalRef}
          className="absolute top-full right-0 mt-2 w-72 bg-[#161b22] border border-white/10 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <PeopleRoundedIcon sx={{ fontSize: 16 }} />
              Editors ({editors.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {[...editors].reverse().map((editor, index) => (
                <div
                  key={editor.userId}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                    style={{
                      backgroundColor: editor.avatarBgColor || getAvatarColor(index),
                    }}
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {editor.name || editor.email || "Unknown"}
                      {editor.userId === currentUserId && (
                        <span className="ml-2 text-xs text-gray-400">(You)</span>
                      )}
                    </p>
                    {editor.email && editor.name && (
                      <p className="text-xs text-gray-400 truncate">
                        {editor.email}
                      </p>
                    )}
                  </div>
                  {editor.lastEditedAt && (
                    <span className="text-xs text-gray-500 shrink-0">
                      {new Date(editor.lastEditedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
