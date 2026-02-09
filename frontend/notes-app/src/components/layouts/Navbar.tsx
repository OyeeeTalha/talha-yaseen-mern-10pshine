import { Button } from "../ui/button";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-slate-200 dark:border-border-dark bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 lg:px-20">
      <Link
        to="/"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex items-center gap-3 group cursor-pointer select-none"
      >
        <style>{`
          @keyframes kid-bounce {
            0%, 100% { transform: translateY(0); }
            10% { transform: translateY(-5px) rotate(-2deg); }
            20% { transform: translateY(0) rotate(0deg); }
          }
        `}</style>
        <div className="flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 ease-out">
          <EditNoteRoundedIcon sx={{ fontSize: 40 }} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white flex items-baseline" style={{ fontFamily: "'Outfit', sans-serif" }}>
          <span className="inline-block hover:text-primary transition-colors" style={{ animation: "kid-bounce 2.5s ease-in-out infinite", animationDelay: "0.1s" }}>M</span>
          <span className="inline-block hover:text-primary transition-colors" style={{ animation: "kid-bounce 2.5s ease-in-out infinite", animationDelay: "1.4s" }}>a</span>
          <span className="inline-block hover:text-primary transition-colors" style={{ animation: "kid-bounce 2.5s ease-in-out infinite", animationDelay: "0.3s" }}>n</span>
          <span className="inline-block hover:text-primary transition-colors" style={{ animation: "kid-bounce 2.5s ease-in-out infinite", animationDelay: "1.8s" }}>t</span>
          <span className="inline-block hover:text-primary transition-colors" style={{ animation: "kid-bounce 2.5s ease-in-out infinite", animationDelay: "0.6s" }}>i</span>
          <span className="inline-block hover:text-primary transition-colors" style={{ animation: "kid-bounce 2.5s ease-in-out infinite", animationDelay: "1.1s" }}>q</span>
          <span className="text-primary inline-block animate-pulse ml-0.5">.</span>
        </h2>
      </Link>
      <nav className="hidden md:flex items-center gap-8">
        <a
          className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          href="#features"
        >
          Features
        </a>
        <a
          className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          href="#about"
        >
          About
        </a>
        <a
          className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          href="#connect"
        >
          Connect
        </a>
      </nav>
      <div className="flex items-center gap-4">
        <Button
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-half h-9 px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          asChild
        >
          <Link to="/signin">
            <span className="truncate">Sign In</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
