import { useState, useEffect } from "react";
import { UserAuth } from "@/hooks/userAuth";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import { ToastContainer } from "@/components/ui/toast";
import { 
    ACCOUNT_DEACTIVATION_GRACE_PERIOD_SECONDS, 
    REACTIVATION_REQUEST_COOLDOWN_SECONDS 
} from "@/config/timers.config";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function AccountDeactivated() {
  const { user, signout } = UserAuth();
  const { toasts, hideToast, success, error: showError } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);
  const [subject, setSubject] = useState("Reactivation Request");
  const [message, setMessage] = useState("");
  const [canReactivateDirectly, setCanReactivateDirectly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  // Cooldown states
  const [requestCooldownLeft, setRequestCooldownLeft] = useState<string | null>(null);
  const [canRequest, setCanRequest] = useState(true);

  // Access the nested user object from the session
  const userData = user?.user;

  // Grace Period Timer
  useEffect(() => {
    if (userData?.deactivatedAt) {
      const gracePeriodMs = ACCOUNT_DEACTIVATION_GRACE_PERIOD_SECONDS * 1000;
      // Backend stores deactivatedAt as Unix timestamp in seconds, convert to Ms
      const deactivationTime = userData.deactivatedAt * 1000;
      const targetTime = deactivationTime + gracePeriodMs;

      const updateTimer = () => {
        const now = Date.now();
        const diff = targetTime - now;

        if (diff <= 0) {
          setCanReactivateDirectly(false);
          setTimeLeft("0d 0h 0m 0s");
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        setCanReactivateDirectly(true);
      };

      updateTimer(); // Initial call
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [userData]); 

  // Request Cooldown Timer
  useEffect(() => {
    if (userData?.reactivationRequestSubmitted && userData?.reactivationRequestSubmittedAt) {
        const cooldownMs = REACTIVATION_REQUEST_COOLDOWN_SECONDS * 1000;
        const lastRequestTime = userData.reactivationRequestSubmittedAt * 1000;
        const nextRequestTime = lastRequestTime + cooldownMs;
        
        const updateCooldown = () => {
            const now = Date.now();
            const diff = nextRequestTime - now;

            if (diff <= 0) {
                setCanRequest(true);
                setRequestCooldownLeft(null);
                return;
            }

            setCanRequest(false);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setRequestCooldownLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        updateCooldown();
        const interval = setInterval(updateCooldown, 1000);
        return () => clearInterval(interval);
    } else {
        // If not submitted or no timestamp, allow request (or handled by submitted flag in legacy cases)
        setCanRequest(true);
    }
  }, [userData]); 

  const handleBackToLogin = async () => {
    await signout();
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${VITE_API_URL}/user/reactivate`,
        {},
        { withCredentials: true }
      );
      // Simulate progress for UX
      await new Promise(resolve => setTimeout(resolve, 800));
      success("Account reactivated! Redirecting...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to reactivate account");
      setLoading(false);
    } 
    // Note: Loading state stays true on success to prevent interaction during redirect
  };

  const handleRequestReactivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequesting(true);
    try {
      await axios.post(
        `${VITE_API_URL}/user/reactivation-request`,
        { subject, message },
        { withCredentials: true }
      );
      success("Request submitted successfully. We will contact you shortly.");
      // Reload to refresh user session data and activate cooldown UI
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to submit request");
      setIsRequesting(false); // Only stop requesting state on error, on success we reload
    } 
  };
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0d1117] font-poppins">
      <ToastContainer toasts={toasts} onClose={hideToast} />
      
      <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl w-full max-w-[460px] p-8 shadow-2xl text-center">
        {/* ... Header Icon ... */}
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Account Deactivated
        </h1>

        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          It looks like your account is currently inactive. If you believe this is
          a mistake or wish to reactivate your subscription, please let us know
          below.
        </p>

        {canReactivateDirectly ? (
          <div className="mb-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">Time Left To Recover</p>
              <div className="text-2xl font-mono font-bold text-blue-400 tracking-wider">
                {timeLeft || "Calculated..."} 
              </div>
              <p className="text-xs text-gray-500 mt-2">
                After this period, your data will be permanently deleted.
              </p>
            </div>
            
            {loading && (
              <div className="w-full bg-gray-700/50 rounded-full h-1.5 mb-3 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full animate-[shimmer_1s_infinite] w-1/2 mx-auto"></div>
                {/* Simple indeterminate animation using inline style for simplicity or standard CSS */}
                <style>{`
                  @keyframes progress-loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                  }
                `}</style>
                <div style={{animation: 'progress-loading 1.5s infinite linear', width: '50%', height: '100%', background: '#3b82f6', borderRadius: '9999px'}}></div>
              </div>
            )}

            <button
              onClick={handleReactivate}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? "Reactivating Account..." : "Reactivate My Account"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequestReactivation} className="text-left mb-6">
            <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-lg mb-6 text-center">
                <p className="text-red-400 text-sm font-medium">Grace Period Expired</p>
                <p className="text-xs text-red-400/70 mt-1">Please contact support to restore access.</p>
            </div>

            {!canRequest && requestCooldownLeft ? (
                <div className="py-8 px-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl mb-6 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 ring-1 ring-emerald-500/20">
                         <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h3 className="text-emerald-400 text-lg font-bold mb-2">Request Submitted</h3>
                    <p className="text-emerald-200/70 text-sm leading-relaxed mb-6 max-w-[280px] mx-auto">
                        Our team has received your reactivation request. We will review it and contact you shortly.
                    </p>
                    <div className="bg-emerald-950/40 rounded-lg p-3 inline-block border border-emerald-500/10 w-full max-w-[300px]">
                        <p className="text-xs text-emerald-400/80 mb-1">You can send another request in:</p>
                         <p className="text-lg font-mono font-bold text-emerald-400">
                             {requestCooldownLeft}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">
                        Subject
                    </label>
                    <div className="relative">
                        <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-[#0d1117] border border-white/10 text-white text-sm rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 block p-3 pr-10 outline-none transition-all placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Reactivation Request"
                        required
                        readOnly
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </div>
                    </div>
                    </div>

                    <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full bg-[#0d1117] border border-white/10 text-white text-sm rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 block p-3 outline-none transition-all resize-none placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Hi team, I'm not sure why my account was deactivated..."
                        required
                    />
                    </div>

                    <button
                    type="submit"
                    disabled={isRequesting}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isRequesting ? "Sending..." : "Send Request ➤"}
                    </button>
                </>
            )}
          </form>
        )}

        <button
          onClick={handleBackToLogin}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1 mx-auto"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Login
        </button>
      </div>
    </div>
  );
}
