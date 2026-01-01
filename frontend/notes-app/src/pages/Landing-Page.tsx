import Navbar from "@/components/layouts/Navbar";
import { Button } from "@/components/ui/button";
import { ZapIcon, CloudSyncIcon, PenOffIcon, ListTreeIcon, NotebookPenIcon } from "lucide-react";
function LandingPage() {
    return(
        <>

        <Navbar/>
        <main className="flex-grow flex flex-col items-center w-full">
            {/* <!-- Hero Section --> */}
            <section className="w-full relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 px-6 lg:pl-20 lg:pr-0 max-w-[1800px]">
<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
<div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]"></div>
<div className="absolute top-[20%] right-[0%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[100px]"></div>
</div>
<div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center">
<div className="flex flex-col items-start gap-8 pr-6 lg:pr-12">
<div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-2">
<span className="mr-2">✨</span> Just shipped v2.0
                <span className="material-symbols-outlined text-xs ml-1">chevron_right</span>
</div>
<h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                Capture ideas <br className="hidden lg:block"/>
<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">at the speed of thought.</span>
</h1>
<p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                The note-taking app designed for modern students and professionals. Organize your projects, collaborate in real-time, and never lose a brilliant idea again.
            </p>
<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
<Button className="flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all">
                    Get started
                </Button>
</div>
<div className="pt-6 border-t border-slate-200/50 dark:border-white/10 w-full max-w-md mt-4">
<p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">TRUSTED BY TEAMS AT</p>
<div className="flex gap-6 opacity-60 grayscale items-center">
<span className="text-base font-bold font-serif text-slate-600 dark:text-slate-400">ACME</span>
<span className="text-base font-bold font-sans text-slate-600 dark:text-slate-400">GlobalTech</span>
<span className="text-base font-bold font-mono text-slate-600 dark:text-slate-400">NEXUS</span>
</div>
</div>
</div>
<div className="relative w-full h-[700px] flex items-center justify-end overflow-visible">
<div className="absolute right-[-100px] lg:right-[-20%] w-[120%] h-full rounded-l-xl border border-r-0 border-slate-200 dark:border-border-dark bg-white dark:bg-[#111827] shadow-2xl overflow-hidden">
<img className="absolute w-full h-[700px] object-cover object-left" src="../../public/images/Screen_notes.png" />
</div>
</div>
</div>
</section>
            {/* <!-- Features Bento Grid --> */}
            <section className="w-full px-6 py-20 lg:px-20 bg-slate-50 dark:bg-[#0d1218]">
            <div className="max-w-[1200px] mx-auto flex flex-col gap-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-4 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                            Everything you need to focus.
                                        </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
                                            Powerful features wrapped in a simple design. We removed the clutter so you can focus on what matters.
                                        </p>
            </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* <!-- Feature 1 --> */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PenOffIcon className="w-6 h-6"/>
            </div>
            <div>
            <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Distraction-free</h3>
            <p className="text-slate-500 dark:text-slate-400">An interface that fades away when you type. Pure focus mode for deep work sessions.</p>
            </div>
            <div className="absolute right-0 top-0 h-24 w-24 bg-gradient-to-br from-primary/20 to-transparent blur-2xl"></div>
            </div>
            {/* <!-- Feature 2 --> */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all md:col-span-2">
            <div className="flex flex-col md:flex-row gap-8 h-full">
            <div className="flex flex-col justify-center flex-1">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
            <ListTreeIcon className="w-6 h-6"/>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Infinite Nesting</h3>
            <p className="text-slate-500 dark:text-slate-400">Organize your thoughts hierarchically. Create pages inside pages without limits, building a knowledge base that grows with you.</p>
            </div>
            <div className="flex-1 relative min-h-[160px] rounded-lg bg-background-light dark:bg-background-dark border border-slate-200 dark:border-border-dark p-4 overflow-hidden">
            {/* <!-- Abstract visualization of nesting --> */}
            <div className="absolute left-6 top-6 w-3/4 h-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="absolute left-10 top-16 w-3/4 h-8 bg-slate-200 dark:bg-slate-700 rounded-md opacity-80"></div>
            <div className="absolute left-14 top-26 w-3/4 h-8 bg-slate-200 dark:bg-slate-700 rounded-md opacity-60"></div>
            <div className="absolute left-18 top-36 w-3/4 h-8 bg-slate-200 dark:bg-slate-700 rounded-md opacity-40"></div>
            </div>
            </div>
            </div>
            {/* <!-- Feature 3 --> */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all md:col-span-2">
            <div className="flex flex-col md:flex-row-reverse gap-8 h-full">
            <div className="flex flex-col justify-center flex-1">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
            <CloudSyncIcon className="w-6 h-6"/>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Real-time Sync &amp; Collab</h3>
            <p className="text-slate-500 dark:text-slate-400">Seamlessly sync across all devices. Share pages with teammates and edit together in real-time without conflicts.</p>
            </div>
            <div className="flex-1 relative min-h-[160px] flex items-center justify-center">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden" data-alt="Abstract representation of cloud synchronization with connecting lines" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB9Jt6ANaD3AssO6w2V0ITk2wUmuGZwlWUeuRyitAvWWFWAmks3cOLuIet5gdXl19zNpPa8x5pwrSDTbaLhYhslh5XXRHrWF539CoJxf1J515EKghaVaima3KR5Xd7C5ytLFpXJfZwoakG4XeWMPOm81o_byCJDkRmZfTNUYZxhUTO1RrY3QdBdsvd83C186pLTF0B-84nM7HXBqIpz7d9FA6fjgDzz2eLv68_99ilI3W-EeiObX3PJn371IL8LEKONPZIwyxZ2jTui")', backgroundSize: 'cover', backgroundPosition: 'center'}}>
            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
            </div>
            </div>
            </div>
            </div>
            {/* <!-- Feature 4 --> */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-8 shadow-sm hover:shadow-md transition-all">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <ZapIcon className="w-6 h-6"/>
            </div>
            <div>
            <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Instant Search</h3>
            <p className="text-slate-500 dark:text-slate-400">Find anything in milliseconds. Our optimized search engine helps you recall information instantly.</p>
            </div>
            <div className="absolute right-0 bottom-0 h-24 w-24 bg-gradient-to-tl from-orange-500/10 to-transparent blur-2xl"></div>
            </div>
            </div>
            </div>
            </section>
            {/* <!-- CTA Section --> */}
            <section className="w-full px-6 py-24 lg:px-20 max-w-[1200px]">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center shadow-2xl md:px-12 md:py-24">
            {/* <!-- Background Pattern --> */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
            <div className="relative z-10 flex flex-col items-center gap-6">
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-white max-w-3xl">
                                        Ready to organize your life?
                                    </h2>
            <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
                                        Start your free 14-day trial today. No credit card required, cancel anytime.
                                    </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button className="flex min-w-[160px] h-12 items-center justify-center rounded-lg bg-white text-primary text-base font-bold hover:bg-slate-100 transition-colors shadow-lg">
                                            Get Started Now
                                        </button>
            <button className="flex min-w-[160px] h-12 items-center justify-center rounded-lg border border-white/30 bg-primary text-white text-base font-bold hover:bg-white/10 transition-colors">
                                            View Pricing
                                        </button>
            </div>
            <p className="mt-4 text-sm text-white/60">Includes access to all premium features.</p>
            </div>
            </div>
            </section>
            </main>
            {/* <!-- Footer --> */}
            <footer className="border-t border-slate-200 dark:border-border-dark bg-background-light dark:bg-background-dark px-6 py-12 lg:px-20">
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between gap-10">
            <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <NotebookPenIcon className="w-8 h-8"/>
            <span className="text-lg font-bold">NotesApp</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
                                    Designed for clarity, built for speed. The note-taking app for modern professionals.
                                </p>
            <div className="flex gap-4 mt-2">
            <a className="text-slate-400 hover:text-primary" href="#"><span className="sr-only">Twitter</span><svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg></a>
            <a className="text-slate-400 hover:text-primary" href="#"><span className="sr-only">GitHub</span><svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path></svg></a>
            </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
            <h4 className="font-bold text-slate-900 dark:text-white">Product</h4>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Features</a>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Integrations</a>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Pricing</a>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Changelog</a>
            </div>
            <div className="flex flex-col gap-3">
            <h4 className="font-bold text-slate-900 dark:text-white">Resources</h4>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Community</a>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Help Center</a>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">API Docs</a>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">System Status</a>
            </div>
            <div className="flex flex-col gap-3">
            <h4 className="font-bold text-slate-900 dark:text-white">Company</h4>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">About</a>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Blog</a>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Careers</a>
            <a className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Legal</a>
            </div>
            </div>
            </div>
            <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
                            © 2024 NotesApp Inc. All rights reserved.
                        </div>
            </footer>
        </>
    );
    }

    export default LandingPage;


    