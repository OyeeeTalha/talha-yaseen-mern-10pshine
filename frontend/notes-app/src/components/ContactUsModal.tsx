import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import { useToast } from "@/hooks/useToast";
// Local fallback for UX; Backend enforces this via SubmissionLog
const CONTACT_US_COOLDOWN_SECONDS = 604800; // 7 days

interface ContactUsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const VITE_API_URL = import.meta.env.VITE_API_URL;
const LAST_CONTACT_KEY = "mantiq_last_contact_ts";

export default function ContactUsModal({ isOpen, onClose }: ContactUsModalProps) {
    const { success, error: showError } = useToast();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);

    // Check cooldown on open
    useEffect(() => {
        if (isOpen) {
            const lastContactTime = localStorage.getItem(LAST_CONTACT_KEY);
            if (lastContactTime) {
                const COOLDOWN_MS = CONTACT_US_COOLDOWN_SECONDS * 1000;
                const timeSinceLastContact = Date.now() - parseInt(lastContactTime, 10);
                if (timeSinceLastContact < COOLDOWN_MS) {
                    setCooldownRemaining(Math.ceil((COOLDOWN_MS - timeSinceLastContact) / 1000));
                } else {
                    setCooldownRemaining(null);
                }
            } else {
                setCooldownRemaining(null);
            }
        }
    }, [isOpen]);

    // Close when clicking overlay
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${VITE_API_URL}/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, subject: "Contact Us Inquiry", message }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to send message");
            }

            // Update Rate Limit Timestamp
            localStorage.setItem(LAST_CONTACT_KEY, Date.now().toString());

            success("Message sent successfully! We'll get back to you soon.");
            setEmail("");
            setMessage("");
            onClose();
        } catch (error: any) {
            showError(error.message || "Failed to send message");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // View: Cooldown Active
    if (cooldownRemaining !== null) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={handleOverlayClick}
            >
                <div className="relative w-full max-w-sm bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center">
                    <div className="flex justify-center mb-4 text-primary">
                        <AccessTimeFilledRoundedIcon sx={{ fontSize: 48 }} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Request Already Sent</h2>
                    <p className="text-slate-400 text-sm mb-6">
                        Chill mate! You've already submitted a request. <br />
                        Please wait a moment before sending another.
                    </p>
                    <Button onClick={onClose} className="w-full bg-primary hover:bg-primary-hover text-white font-semibold">
                        Got it
                    </Button>
                </div>
            </div>
        );
    }

    // View: Contact Form
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleOverlayClick}
        >
            <div className="relative w-full max-w-md bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Contact Us</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                        <CloseRoundedIcon sx={{ fontSize: 24 }} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                            Your Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#0d1117] border border-white/10 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary block p-3 outline-none transition-all placeholder:text-gray-600"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            className="w-full bg-[#0d1117] border border-white/10 text-white text-sm rounded-lg focus:border-primary focus:ring-1 focus:ring-primary block p-3 outline-none transition-all resize-none placeholder:text-gray-600"
                            placeholder="How can we help you?"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 mt-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all"
                    >
                        {isLoading ? "Sending..." : "Send Message"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
