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
  // Generate share link mutation
  const generateLinkMutation = useMutation({
    mutationFn: (level: "readonly" | "edit") =>
      generateShareLink(noteId, level),
    onSuccess: (response) => {
      console.log("Generate link success data:", response);
      // Handle both nested data object and direct response
      const shareData = response?.data || response;
      const shareId = shareData?.shareId;
      // Some backends might return the full shareUrl
      const existingShareUrl = shareData?.shareUrl;

      if (existingShareUrl) {
         setShareUrl(existingShareUrl);
         queryClient.invalidateQueries({ queryKey: ["collaborators", noteId] });
         queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      } else if (shareId) {
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/s/${shareId}`);
        queryClient.invalidateQueries({ queryKey: ["collaborators", noteId] });
        queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      } else {
        console.error("No shareId in response data", response);
        showToast("Received invalid data from server", "error");
      }
    },
    onError: (error) => {
      console.error("Generate link error:", error);
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
    console.log("Collaborators data effect triggered:", collaboratorsData);
    if (collaboratorsData) {
      // Handle both nested data object and direct response
      const data = collaboratorsData.data || collaboratorsData;
      const { shareId, accessLevel: currentLevel } = data;
      
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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] backdrop-blur-sm transition-all" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-[440px] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </div>
            <div>
              <h2 className="m-0 text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Share Note</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">Collaborate and share with others</p>
            </div>
          </div>
          <button 
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" 
            onClick={onClose}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Access Level */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 ml-1">Access Permissions</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
            <button
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 border border-transparent ${
                accessLevel === "readonly" 
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border-slate-200 dark:border-slate-700" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
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
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Can View
            </button>
            <button
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 border border-transparent ${
                accessLevel === "edit" 
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border-slate-200 dark:border-slate-700" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
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
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              Can Edit
            </button>
          </div>
        </div>

        {/* Web Link */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 ml-1">Public Link</label>
          <div className="flex items-center gap-0 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <div className="pl-3 text-slate-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <input
              type="text"
              className="flex-1 border-0 bg-transparent py-3.5 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none w-0 placeholder:text-slate-400"
              value={shareUrl || "Link not generated yet"}
              readOnly
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 space-y-3">
          {!shareUrl ? (
            <button
              className="w-full relative overflow-hidden group flex items-center justify-center gap-2 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[15px] font-bold cursor-pointer transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleGenerateLink}
              disabled={generateLinkMutation.isPending}
            >
              <span className="relative z-10 flex items-center gap-2">
                {generateLinkMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Link...
                  </>
                ) : (
                  <>
                    Generate Link
                  </>
                )}
              </span>
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-[15px] font-bold cursor-pointer transition-all active:scale-[0.98] ${
                  copied 
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/20" 
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                }`}
                onClick={handleCopyLink}
                disabled={generateLinkMutation.isPending}
              >
                {copied ? (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>

              <button
                className="w-full flex items-center justify-center gap-2 py-2.5 px-5 bg-transparent text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 text-sm font-semibold transition-colors disabled:opacity-50"
                onClick={() => disableSharingMutation.mutate()}
                disabled={disableSharingMutation.isPending}
              >
                {disableSharingMutation.isPending ? "Disabling..." : "Stop Sharing"}
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-slate-400 mb-6 font-medium">
          Anyone with this link can {accessLevel === "readonly" ? "only view" : "edit"} this note.
        </p>

        {/* Shared With Section */}
        {collaborators.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Collaborators</span>
              <div className="flex items-center">
                {collaborators.slice(0, 4).map((collab, index) => (
                  <div
                    key={collab.userId}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white dark:border-slate-800 -ml-3 shadow-sm first:ml-0 transition-transform hover:-translate-y-1 hover:z-10"
                    style={{
                      backgroundColor: collab.user?.avatarBgColor || "#64748b",
                      zIndex: 4 - index,
                    }}
                    title={collab.user?.name || collab.user?.email || "Unknown"}
                  >
                    {isValidImageUrl(getAvatarUrl(collab.user?.avatar || "")) ? (
                      <img
                        src={getAvatarUrl(collab.user?.avatar || "")}
                        alt={collab.user?.name || ""}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(collab.user?.name, collab.user?.email)
                    )}
                  </div>
                ))}
                {collaborators.length > 4 && (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 bg-slate-100 border-2 border-white dark:border-slate-800 -ml-3 z-0">
                    +{collaborators.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareNoteModal;
