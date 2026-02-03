import { useState, useRef, useEffect } from "react";
import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Navbar";
import { Button } from "@/components/ui/button";
import EditOffRoundedIcon from "@mui/icons-material/EditOffRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Link } from "react-router-dom";
import ContactUsModal from "@/components/ContactUsModal";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

function LandingPage() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { toasts, hideToast } = useToast();

  return (
    <>
      <ToastContainer toasts={toasts} onClose={hideToast} />
      <Navbar />
      <main className="flex-grow flex flex-col items-center w-full">
        <section className="w-full relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 px-6 lg:pl-20 lg:pr-0 max-w-[1800px]">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]"></div>
            <div className="absolute top-[20%] right-[0%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[100px]"></div>
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center">
            <div className="flex flex-col items-start gap-8 pr-6 lg:pr-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-2">
                <span className="mr-2">✨</span> Just shipped v2.0
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                Capture ideas <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                  at the speed of thought.
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                The note-taking app designed for modern students and
                professionals. Organize your projects, collaborate in real-time,
                and never lose a brilliant idea again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
                <Button
                  asChild
                  className="flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all"
                >
                  <Link to="/signin">
                    Get started
                  </Link>
                </Button>
              </div>
              <div className="pt-6 border-t border-slate-200/50 dark:border-white/10 w-full max-w-md mt-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                  TRUSTED BY TEAMS AT
                </p>
                <div className="flex gap-6 opacity-60 grayscale items-center">
                  <span className="text-base font-bold font-serif text-slate-600 dark:text-slate-400">
                    10Pearls
                  </span>
                  <span className="text-base font-bold font-sans text-slate-600 dark:text-slate-400">
                    Google
                  </span>
                  <span className="text-base font-bold font-mono text-slate-600 dark:text-slate-400">
                    Microsoft
                  </span>
                </div>
              </div>
            </div>
            <div className="relative w-full h-[700px] flex items-center justify-end overflow-visible animate-in fade-in slide-in-from-right-12 duration-1000 delay-200 fill-mode-backwards">
              <div className="absolute right-[-100px] lg:right-[-20%] w-[120%] h-full rounded-l-xl border border-r-0 border-slate-200 dark:border-border-dark bg-white dark:bg-[#111827] shadow-2xl overflow-hidden">
                <img
                  className="absolute w-full h-[700px] object-cover object-left"
                  src="/images/Screen_notes.png"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full px-6 py-20 lg:px-20 bg-slate-50 dark:bg-[#0d1218] scroll-mt-32">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <FadeIn className="flex flex-col gap-4 max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Everything you need to focus.
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  Powerful features wrapped in a simple design. We removed the
                  clutter so you can focus on what matters.
                </p>
              </FadeIn>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FadeIn delay={0} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all h-full">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <EditOffRoundedIcon sx={{ fontSize: 30 }} />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                    Distraction-free
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    An interface that fades away when you type. Pure focus mode
                    for deep work sessions.
                  </p>
                </div>
                <div className="absolute right-0 top-0 h-24 w-24 bg-gradient-to-br from-primary/20 to-transparent blur-2xl"></div>
              </FadeIn>

              <FadeIn delay={100} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all md:col-span-2 h-full">
                <div className="flex flex-col md:flex-row gap-8 h-full">
                  <div className="flex flex-col justify-center flex-1">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                      <SpaceDashboardRoundedIcon sx={{ fontSize: 30 }} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                      Limitless Canvas
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Don't just write. Build. Embed images, code snippets, videos, and
                      dynamic content to create notes that truly come alive.
                    </p>
                  </div>
                  <div className="flex-1 relative min-h-[160px] flex items-center justify-center rounded-lg bg-slate-50/50 dark:bg-[#111827]/50 border border-slate-200/50 dark:border-white/5 p-6 overflow-hidden">
                    <div className="flex flex-col gap-3 w-full max-w-[320px]">
                      {/* Image Block */}
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/10 text-blue-500">
                          <ImageRoundedIcon sx={{ fontSize: 18 }} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-1.5 w-1/3 rounded-full bg-slate-200 dark:bg-slate-700/50"></div>
                          <div className="h-1.5 w-2/3 rounded-full bg-slate-100 dark:bg-slate-800/50"></div>
                        </div>
                      </div>

                      {/* Code Block */}
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-[#0d1117] shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
                          <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="flex-1 flex justify-end">
                          <CodeRoundedIcon sx={{ fontSize: 16, color: '#8b949e' }} />
                        </div>
                      </div>

                      {/* Video Block */}
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] shadow-sm transform group-hover:-translate-y-1 transition-transform duration-300 delay-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-pink-500/10 text-pink-500">
                          <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-1.5 w-1/2 rounded-full bg-slate-200 dark:bg-slate-700/50"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all md:col-span-2 h-full">
                <div className="flex flex-col md:flex-row-reverse gap-8 h-full">
                  <div className="flex flex-col justify-center flex-1">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                      <SyncRoundedIcon sx={{ fontSize: 30 }} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                      Smart Sync & Collab
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Keep your notes in sync across all your devices. Share
                      workspaces with your team and collaborate efficiently on
                      projects.
                    </p>
                  </div>
                  <div className="flex-1 relative min-h-[160px] flex items-center justify-center">
                    <div
                      className="relative w-full aspect-video rounded-lg overflow-hidden"
                      data-alt="Abstract representation of cloud synchronization with connecting lines"
                      style={{
                        backgroundImage:
                          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB9Jt6ANaD3AssO6w2V0ITk2wUmuGZwlWUeuRyitAvWWFWAmks3cOLuIet5gdXl19zNpPa8x5pwrSDTbaLhYhslh5XXRHrWF539CoJxf1J515EKghaVaima3KR5Xd7C5ytLFpXJfZwoakG4XeWMPOm81o_byCJDkRmZfTNUYZxhUTO1RrY3QdBdsvd83C186pLTF0B-84nM7HXBqIpz7d9FA6fjgDzz2eLv68_99ilI3W-EeiObX3PJn371IL8LEKONPZIwyxZ2jTui")',
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={100} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all h-full">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <BoltRoundedIcon sx={{ fontSize: 30 }} />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                    Instant Search
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Find anything in milliseconds. Our optimized search engine
                    helps you recall information instantly.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 h-24 w-24 bg-gradient-to-tl from-orange-500/10 to-transparent blur-2xl"></div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-32 w-full py-20 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white overflow-hidden border-y border-slate-200 dark:border-white/5 relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay dark:opacity-20"></div>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-20 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            {/* Left: Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <CodeRoundedIcon fontSize="small" />
                <span>The Architect's Vision.</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black font-['Outfit'] leading-tight text-slate-900 dark:text-white">
                Built with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">obsession</span>,<br /> not by committee.
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-lg">
                Hi, I'm <span className="text-slate-900 dark:text-white font-semibold">Muhammad Talha Yaseen</span>. I built Mantiq to solve my own chaos.
                It's not just an app, it's a manifesto for clear thinking.
                No investors, no bloat, just pure utility.
              </p>
            </div>

            {/* Right: Terminal Visual */}
            <div className="relative group w-full max-w-lg mx-auto lg:ml-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative rounded-lg bg-[#0d1117] border border-white/10 p-6 font-mono text-sm leading-relaxed shadow-2xl">
                <div className="flex gap-2 mb-6 opacity-60">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="text-emerald-400 font-bold flex gap-2"><span className="text-pink-400">$</span> whoami</div>
                    <div className="text-slate-200 ml-4">Muhammad Talha Yaseen <span className="text-slate-500">// Software Architect</span></div>
                  </div>

                  <div>
                    <div className="text-emerald-400 font-bold flex gap-2"><span className="text-pink-400">$</span> cat philosophy.md</div>
                    <div className="text-slate-200 ml-4 border-l-2 border-slate-700 pl-3 italic text-slate-400">
                      "Complexity is the enemy of execution.<br />
                      Simplicity is the soul of reliability."
                    </div>
                  </div>

                  <div>
                    <div className="text-emerald-400 font-bold flex gap-2"><span className="text-pink-400">$</span> git status</div>
                    <div className="text-blue-400 ml-4 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      Shipping v2.0
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-slate-50 dark:bg-[#0d1218]">
          <div className="w-full px-6 py-24 lg:px-20 max-w-[1200px] mx-auto">
            <FadeIn>
              <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center shadow-2xl md:px-12 md:py-24">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                ></div>
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-white max-w-3xl">
                    Ready to organize your life?
                  </h2>
                  <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
                    Open source and free for individuals. Join our community and help shape the future of Mantiq.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button
                      asChild
                      className="flex min-w-[160px] h-12 items-center justify-center rounded-lg bg-white text-primary text-base font-bold hover:bg-slate-100 transition-colors shadow-lg cursor-pointer"
                    >
                      <Link to="/signin">
                        Get Started Now
                      </Link>
                    </Button>
                    <Button
                      onClick={() => setIsContactModalOpen(true)}
                      className="flex min-w-[160px] h-12 items-center justify-center rounded-lg border border-white/30 bg-primary text-white text-base font-bold hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Contact Us
                    </Button>
                  </div>
                  <p className="mt-4 text-sm text-white/60">
                    v2.0 is now available for public preview.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <div id="connect" className="scroll-mt-32">
        <Footer simpleFooter={false} />
      </div>

      <ContactUsModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}

export default LandingPage;
