import { useState } from "react";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";
import { CONTACT_US_COOLDOWN_SECONDS } from "@/config/timers.config";

const VITE_API_URL = import.meta.env.VITE_API_URL;

function ComplexFooter() {
  const { toasts, hideToast, success, error: showError } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinWaitlist = async () => {
    // 0. Check Rate Limit (Waitlist uses same cooldown as Contact)
    const LAST_WAITLIST_KEY = "mantiq_last_waitlist_ts";
    const lastWaitlistTime = localStorage.getItem(LAST_WAITLIST_KEY);
    if (lastWaitlistTime) {
      const COOLDOWN_MS = CONTACT_US_COOLDOWN_SECONDS * 1000;
      const timeSinceLast = Date.now() - parseInt(lastWaitlistTime, 10);
      if (timeSinceLast < COOLDOWN_MS) {
        showError("You're already on the list! We'll be in touch soon.");
        return;
      }
    }

    // 1. Basic Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${VITE_API_URL}/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, type: "contributor_waitlist" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to join waitlist");
      }

      // Update Rate Limit Timestamp
      localStorage.setItem(LAST_WAITLIST_KEY, Date.now().toString());

      success("Welcome to the waitlist! Keep an eye on your inbox.");
      setEmail("");
    } catch (error: any) {
      showError(error.message || "Failed to join waitlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-border-dark bg-background-light dark:bg-background-dark px-6 py-12 lg:px-20 relative">
      <ToastContainer toasts={toasts} onClose={hideToast} />
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex items-center gap-1 text-slate-900 dark:text-white">
            <div className="flex items-center justify-center text-primary">
              <EditNoteRoundedIcon sx={{ fontSize: 35 }} />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Mantiq</span>
          </div>
          <p className="text-sm text-slate-500 max-w-xs">
            Designed for clarity, built for speed. The note-taking app for
            modern professionals.
          </p>
          <div className="flex gap-4 mt-2">
            <a
              className="text-slate-400 hover:text-primary transition-colors"
              href="#"
            >
              <span className="sr-only">Twitter</span>
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a
              className="text-slate-400 hover:text-primary transition-colors"
              href="#"
            >
              <span className="sr-only">GitHub</span>
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  fillRule="evenodd"
                ></path>
              </svg>
            </a>
            <a
              className="text-slate-400 hover:text-primary transition-colors"
              href="#"
            >
              <span className="sr-only">LinkedIn</span>
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
              </svg>
            </a>
            <a
              className="text-slate-400 hover:text-primary transition-colors"
              href="#"
            >
              <span className="sr-only">Facebook</span>
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
            </a>
            <a
              className="text-slate-400 hover:text-primary transition-colors"
              href="#"
            >
              <span className="sr-only">Instagram</span>
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
              </svg>
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto md:max-w-md">
          <h4 className="font-bold text-slate-900 dark:text-white">
            Join the Core Team
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We're building a team of capable maintainers. Enter your email to receive our technical roadmap and contributor challenge.
          </p>
          <div className="flex gap-2">
            <input
              className="flex-1 min-w-0 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="developer@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={handleJoinWaitlist}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Joining..." : "Join Waitlist"}
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
        © 2025 Mantiq Inc. All rights reserved.
      </div>
    </footer>
  );
}

function SimpleFooter() {
  return (
    <footer className="absolute bottom-6 w-full text-center pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
      <div className="text-center text-sm text-slate-500">
        © 2025 Mantiq Inc. All rights reserved.
      </div>
    </footer>
  );
}

function Footer({ simpleFooter }: { simpleFooter: boolean }) {
  if (simpleFooter) {
    return <SimpleFooter />;
  } else {
    return <ComplexFooter />;
  }
}
export default Footer;
