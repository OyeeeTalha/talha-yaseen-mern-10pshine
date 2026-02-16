import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSharedNote } from "@/services/noteServices";
import { UserAuth } from "@/hooks/userAuth";
import LoadingSpinner from "@/components/ui/loading";


export default function SharedNotePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = UserAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // If not authenticated, redirect to signin with callback
  useEffect(() => {
    if (!isAuthLoading && !user?.user) {
      const callbackUrl = encodeURIComponent(location.pathname);
      navigate(`/signin?callback=${callbackUrl}`);
    }
  }, [user, isAuthLoading, navigate, location.pathname]);

  // Fetch shared note to get the actual note ID
  const {
    data: sharedNoteData,
    isLoading: isNoteLoading,
    error,
  } = useQuery({
    queryKey: ["shared-note", shareId],
    queryFn: () => getSharedNote(shareId!),
    enabled: !!shareId && !!user?.user && !hasRedirected,
  });

  // Redirect to main editor with access level when we have the note data
  useEffect(() => {
    if (sharedNoteData?.data?.note?._id && !hasRedirected) {
      setHasRedirected(true);
      const noteId = sharedNoteData.data.note._id;
      const accessLevel = sharedNoteData.data.accessLevel;
      const ownerName = sharedNoteData.data.owner?.name || "Someone";
      
      // Navigate to the main editor with shared note state
      navigate(`/editor/${noteId}`, {
        state: {
          isSharedNote: true,
          accessLevel,
          ownerName,
          shareId,
        },
        replace: true, // Replace current URL so back button works properly
      });
    }
  }, [sharedNoteData, navigate, hasRedirected, shareId]);

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If not authenticated, will redirect (handled by useEffect)
  if (!user?.user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Loading state for note
  if (isNoteLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="text-center text-slate-500 dark:text-slate-400 mt-6 animate-pulse font-medium">
          Loading shared note...
        </p>
      </div>
    );
  }

  // Error state
  if (error || !sharedNoteData?.data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center text-center max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center mb-6 text-red-500 dark:text-red-400 ring-1 ring-red-100 dark:ring-red-900/30">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Note Not Found</h2>
          <p className="mb-8 text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
            This shared note doesn&apos;t exist or the link has expired.
          </p>
          <button 
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
      <LoadingSpinner />
      <p className="text-center text-slate-500 dark:text-slate-400 mt-6 animate-pulse font-medium">
        Opening note...
      </p>
    </div>
  );
}
