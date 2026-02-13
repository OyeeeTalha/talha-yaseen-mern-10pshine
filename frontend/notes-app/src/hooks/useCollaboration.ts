import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { logger } from "@/lib/logger";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const COLLAB_WS_URL = API_URL.replace(/^http/, "ws") + "/collaboration";

interface CollaborationUser {
  name: string;
  color: string;
}

interface UseCollaborationOptions {
  noteId: string | undefined;
  user: CollaborationUser;
  enabled?: boolean;
}

interface CollaborationState {
  doc: Y.Doc;
  provider: HocuspocusProvider | null;
  fragment: Y.XmlFragment;
  isConnected: boolean;
  isSynced: boolean;
  hasInitialContent: boolean;
}

const CURSOR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F8C471", "#82E0AA", "#F1948A", "#AED6F1", "#D7BDE2",
];

export function getCollaborationColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export function useCollaboration({ noteId, user, enabled = true }: UseCollaborationOptions): CollaborationState {
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [hasInitialContent, setHasInitialContent] = useState(false);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);

  // Don't create provider until we have real user info
  const isUserReady = user.name !== "Anonymous";

  const { doc, fragment } = useMemo(() => {
    // Cleanup previous instances
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (docRef.current) {
      docRef.current.destroy();
      docRef.current = null;
    }

    const newDoc = new Y.Doc();
    const newFragment = newDoc.getXmlFragment("document-store");
    docRef.current = newDoc;

    return { doc: newDoc, fragment: newFragment };
  }, [noteId, isUserReady]);

  const provider = useMemo(() => {
    if (!noteId || !enabled || !isUserReady) return null;

    setIsConnected(false);
    setIsSynced(false);
    setHasInitialContent(false);

    const newProvider = new HocuspocusProvider({
      url: COLLAB_WS_URL,
      name: noteId,
      document: doc,
      token: "cookie-auth",
      onConnect() {
        logger.info({ msg: "Collaboration connected", noteId });
        setIsConnected(true);
      },

      onDisconnect() {
        logger.warn({ msg: "Collaboration disconnected", noteId });
        setIsConnected(false);
      },

      onSynced({ state }: { state: boolean }) {
        logger.info({ msg: "Collaboration synced", noteId, state });
        setIsSynced(state);

        if (state) {
          // Check if the Yjs document has content after sync
          const fragment = doc.getXmlFragment("document-store");
          setHasInitialContent(fragment.length > 0);
        }
      },

      onAuthenticationFailed({ reason }: { reason: string }) {
        logger.error({ msg: "Collaboration auth failed", noteId, reason });
      },
    });

    // Set awareness local state (cursor info) with real user data
    newProvider.setAwarenessField("user", user);

    providerRef.current = newProvider;
    return newProvider;
  }, [noteId, doc, enabled, isUserReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      if (docRef.current) {
        docRef.current.destroy();
        docRef.current = null;
      }
    };
  }, []);

  return {
    doc,
    provider,
    fragment,
    isConnected,
    isSynced,
    hasInitialContent,
  };
}
