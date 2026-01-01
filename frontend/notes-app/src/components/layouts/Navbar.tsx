import { Button } from "../ui/button";
import { NotebookPenIcon } from "lucide-react";


export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-slate-200 dark:border-border-dark bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 lg:px-20">
        <div className="flex items-center gap-3">
        <div className="flex items-center justify-center text-primary">
        <NotebookPenIcon className="w-8 h-8"/>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-tight">NotesApp</h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
        <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" href="#">Features</a>
        <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" href="#">Pricing</a>
        <a className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" href="#">About</a>
        </nav>
        <div className="flex items-center gap-4">
        <Button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-half h-9 px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
        <span className="truncate">Sign In</span>
        </Button>
        </div>
</header>
    ); 
}