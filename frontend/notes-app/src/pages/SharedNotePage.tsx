import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSharedNote } from "@/services/noteServices";
import { UserAuth } from "@/hooks/userAuth";
import LoadingSpinner from "@/components/ui/loading";
import "./SharedNotePage.css";

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
    return <LoadingSpinner />;
  }

  // If not authenticated, will redirect (handled by useEffect)
  if (!user?.user) {
    return <LoadingSpinner />;
  }

  // Loading state for note
  if (isNoteLoading) {
    return (
      <div className="shared-note-container">
        <LoadingSpinner />
        <p style={{ textAlign: "center", color: "#6b7280", marginTop: "16px" }}>
          Loading shared note...
        </p>
      </div>
    );
  }

  // Error state
  if (error || !sharedNoteData?.data) {
    return (
      <div className="shared-note-container">
        <div className="shared-note-error">
          <h2>Note Not Found</h2>
          <p>This shared note doesn't exist or the link has expired.</p>
          <button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="shared-note-container">
      <LoadingSpinner />
      <p style={{ textAlign: "center", color: "#6b7280", marginTop: "16px" }}>
        Opening note...
      </p>
    </div>
  );
}
