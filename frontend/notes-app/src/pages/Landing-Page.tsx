import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Navbar";
import { Button } from "@/components/ui/button";
import EditOffRoundedIcon from "@mui/icons-material/EditOffRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col items-center w-full">
        <section className="w-full relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 px-6 lg:pl-20 lg:pr-0 max-w-[1800px]">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]"></div>
            <div className="absolute top-[20%] right-[0%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[100px]"></div>
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center">
            <div className="flex flex-col items-start gap-8 pr-6 lg:pr-12">
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
                <Button className="flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all">
                  Get started
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
            <div className="relative w-full h-[700px] flex items-center justify-end overflow-visible">
              <div className="absolute right-[-100px] lg:right-[-20%] w-[120%] h-full rounded-l-xl border border-r-0 border-slate-200 dark:border-border-dark bg-white dark:bg-[#111827] shadow-2xl overflow-hidden">
                <img
                  className="absolute w-full h-[700px] object-cover object-left"
                  src="../../public/images/Screen_notes.png"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full px-6 py-20 lg:px-20 bg-slate-50 dark:bg-[#0d1218]">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col gap-4 max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Everything you need to focus.
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  Powerful features wrapped in a simple design. We removed the
                  clutter so you can focus on what matters.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all">
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
              </div>

              <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all md:col-span-2">
                <div className="flex flex-col md:flex-row gap-8 h-full">
                  <div className="flex flex-col justify-center flex-1">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                      <AccountTreeRoundedIcon sx={{ fontSize: 30 }} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                      Infinite Nesting
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Organize your thoughts hierarchically. Create pages inside
                      pages without limits, building a knowledge base that grows
                      with you.
                    </p>
                  </div>
                  <div className="flex-1 relative min-h-[160px] rounded-lg bg-background-light dark:bg-background-dark border border-slate-200 dark:border-border-dark p-4 overflow-hidden">
                    <div className="absolute left-6 top-6 w-3/4 h-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    <div className="absolute left-10 top-16 w-3/4 h-8 bg-slate-200 dark:bg-slate-700 rounded-md opacity-80"></div>
                    <div className="absolute left-14 top-26 w-3/4 h-8 bg-slate-200 dark:bg-slate-700 rounded-md opacity-60"></div>
                    <div className="absolute left-18 top-36 w-3/4 h-8 bg-slate-200 dark:bg-slate-700 rounded-md opacity-40"></div>
                  </div>
                </div>
              </div>

              <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all md:col-span-2">
                <div className="flex flex-col md:flex-row-reverse gap-8 h-full">
                  <div className="flex flex-col justify-center flex-1">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                      <SyncRoundedIcon sx={{ fontSize: 30 }} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                      Real-time Sync &amp; Collab
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Seamlessly sync across all devices. Share pages with
                      teammates and edit together in real-time without
                      conflicts.
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
              </div>

              <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all">
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
              </div>
            </div>
          </div>
        </section>

        <section className="w-full px-6 py-24 lg:px-20 max-w-[1200px]">
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
                Start your free 14-day trial today. No credit card required,
                cancel anytime.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Button className="flex min-w-[160px] h-12 items-center justify-center rounded-lg bg-white text-primary text-base font-bold hover:bg-slate-100 transition-colors shadow-lg">
                  Get Started Now
                </Button>
                <Button className="flex min-w-[160px] h-12 items-center justify-center rounded-lg border border-white/30 bg-primary text-white text-base font-bold hover:bg-white/10 transition-colors">
                  View Pricing
                </Button>
              </div>
              <p className="mt-4 text-sm text-white/60">
                Includes access to all premium features.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer simpleFooter={false} />
    </>
  );
}

export default LandingPage;
