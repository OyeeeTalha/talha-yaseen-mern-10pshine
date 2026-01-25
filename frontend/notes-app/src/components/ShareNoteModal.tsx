import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  generateShareLink,
  getCollaborators,
  disableSharing,
} from "@/services/noteServices";
import { useToast } from "@/hooks/useToast";
import { noteKeys } from "@/hooks/useNotes";
import { getAvatarUrl, getInitials, isValidImageUrl } from "@/lib/utils";

interface ShareNoteModalProps {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareNoteModal({
  noteId,
  isOpen,
  onClose,
}: ShareNoteModalProps) {
  const [accessLevel, setAccessLevel] = useState<"readonly" | "edit">(
    "readonly"
  );
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch collaborators
  const { data: collaboratorsData } =
    useQuery({
      queryKey: ["collaborators", noteId],
      queryFn: () => getCollaborators(noteId),
      enabled: isOpen,
    });

  // Generate share link mutation
  const generateLinkMutation = useMutation({
    mutationFn: (level: "readonly" | "edit") =>
      generateShareLink(noteId, level),
    onSuccess: (data) => {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/s/${data.data.shareId}`);
      queryClient.invalidateQueries({ queryKey: ["collaborators", noteId] });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
    onError: () => {
      showToast("Failed to generate share link", "error");
    },
  });

  // Disable sharing mutation
  const disableSharingMutation = useMutation({
    mutationFn: () => disableSharing(noteId),
    onSuccess: () => {
      setShareUrl("");
      queryClient.invalidateQueries({ queryKey: ["collaborators", noteId] });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      showToast("Sharing disabled", "success");
    },
    onError: () => {
      showToast("Failed to disable sharing", "error");
    },
  });

  // Initialize from existing share data
  useEffect(() => {
    if (collaboratorsData?.data) {
      const { shareId, accessLevel: currentLevel } = collaboratorsData.data;
      if (shareId) {
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/s/${shareId}`);
        if (currentLevel) {
          setAccessLevel(currentLevel);
        }
      }
    }
  }, [collaboratorsData]);

  // Handle access level change
  const handleAccessLevelChange = (level: "readonly" | "edit") => {
    setAccessLevel(level);
    generateLinkMutation.mutate(level);
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    if (!shareUrl) {
      // Generate link first if not exists
      generateLinkMutation.mutate(accessLevel);
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast("Link copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  // Handle generate link
  const handleGenerateLink = () => {
    generateLinkMutation.mutate(accessLevel);
  };

  if (!isOpen) return null;

  const collaborators = collaboratorsData?.data?.collaborators || [];

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] backdrop-blur-[4px]" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-[420px] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="m-0 text-lg font-semibold text-gray-900 dark:text-gray-50">Share to web</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Manage access settings</p>
          </div>
          <button 
            className="bg-transparent border-0 p-1 cursor-pointer text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-300 rounded-md transition-all" 
            onClick={onClose}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Access Level */}
        <div className="mb-5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">ACCESS LEVEL</label>
          <div className="flex gap-0 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border-0 bg-transparent rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer transition-all hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-60 disabled:cursor-not-allowed ${
                accessLevel === "readonly" 
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : ""
              }`}
              onClick={() => handleAccessLevelChange("readonly")}
              disabled={generateLinkMutation.isPending}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
              Read-only
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border-0 bg-transparent rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer transition-all hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-60 disabled:cursor-not-allowed ${
                accessLevel === "edit" 
                  ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : ""
              }`}
              onClick={() => handleAccessLevelChange("edit")}
              disabled={generateLinkMutation.isPending}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              Can edit
            </button>
          </div>
        </div>

        {/* Web Link */}
        <div className="mb-5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">WEB LINK</label>
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <div className="text-gray-400 shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <input
              type="text"
              className="flex-1 border-0 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none w-0 placeholder:text-gray-400"
              value={shareUrl || "Click generate to create link"}
              readOnly
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-3">
          {!shareUrl ? (
            <button
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg text-[15px] font-semibold cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleGenerateLink}
              disabled={generateLinkMutation.isPending}
            >
              {generateLinkMutation.isPending ? (
                "Generating..."
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Generate Link
                </>
              )}
            </button>
          ) : (
            <button
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg text-[15px] font-semibold cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleCopyLink}
              disabled={generateLinkMutation.isPending}
            >
              {copied ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-center text-[13px] text-gray-400 mb-5">
          Anyone with the link can{" "}
          {accessLevel === "readonly" ? "view" : "edit"} this page.
        </p>

        {/* Shared With Section */}
        {collaborators.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">Shared with</span>
              <div className="flex items-center">
                {collaborators.slice(0, 3).map((collab, index) => (
                  <div
                    key={collab.userId}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold text-white border-2 border-white dark:border-gray-800 -ml-2 shadow-sm first:ml-0"
                    style={{
                      backgroundColor:
                        collab.user?.avatarBgColor || "#60a5fa",
                      zIndex: 3 - index,
                    }}
                    title={collab.user?.name || collab.user?.email || "Unknown"}
                  >
                    {isValidImageUrl(getAvatarUrl(collab.user?.avatar || "")) ? (
                      <img
                        src={getAvatarUrl(collab.user?.avatar || "")}
                        alt={collab.user?.name || ""}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      getInitials(collab.user?.name, collab.user?.email)
                    )}
                  </div>
                ))}
                {collaborators.length > 3 && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-gray-500 bg-gray-200 border-2 border-white dark:border-gray-800 -ml-2">
                    +{collaborators.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Disable Sharing */}
        {shareUrl && (
          <button
            className="w-full p-2.5 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 cursor-pointer transition-all mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => disableSharingMutation.mutate()}
            disabled={disableSharingMutation.isPending}
          >
            {disableSharingMutation.isPending
              ? "Disabling..."
              : "Disable sharing"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ShareNoteModal;
