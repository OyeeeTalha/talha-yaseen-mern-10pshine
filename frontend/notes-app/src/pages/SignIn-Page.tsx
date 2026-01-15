import Footer from "@/components/layouts/Footer";
import { Button } from "@/components/ui/button";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
function SignInPage() {
  return (
    <main className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center p-4">
      <nav className="absolute top-0 w-full flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-1">
          <div className="flex items-center justify-center text-primary ">
            <EditNoteRoundedIcon sx={{ fontSize: 40 }} />
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">
            NotesApp
          </h2>
        </div>
      </nav>

      <main className="w-full max-w-[420px] flex flex-col">
        <div className=" dark:bg-card-dark rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 p-8 sm:p-10 transition-all duration-300">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <div className="flex items-center justify-center text-primary ">
                <LockRoundedIcon sx={{ fontSize: 30 }} />
              </div>
            </div>
            <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mb-2">
              Log in to NotesApp
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
              Sync your ideas across all devices.
            </p>
          </div>

          <div className="space-y-4">
            <Button className="group relative flex w-full items-center justify-center gap-3 rounded-lg bg-white dark:bg-[#233648] border border-slate-200 dark:border-slate-700 p-3.5 transition-all hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-[#2a4055] dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 dark:focus:ring-offset-[#18222c]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                ></path>
              </svg>
              <span className="text-slate-700 dark:text-white font-semibold text-sm">
                Continue with Google
              </span>
            </Button>

            <Button className="group relative flex w-full items-center justify-center gap-3 rounded-lg bg-[#24292e] text-white p-3.5 transition-all hover:bg-[#2f363d] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 dark:focus:ring-offset-[#18222c]">
              <svg
                className="h-5 w-5 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
              </svg>
              <span className="font-semibold text-sm">
                Continue with GitHub
              </span>
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background-dark dark:bg-card-dark px-2 text-slate-400 dark:text-slate-500 font-medium tracking-wider">
                Secure Access
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            By clicking continue, you agree to our{" "}
            <a
              className="underline hover:text-primary dark:hover:text-primary transition-colors"
              href="#"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="underline hover:text-primary dark:hover:text-primary transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>

        <div className="fixed inset-0 -z-10 pointer-events-none opacity-40 dark:opacity-20 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]"></div>
        </div>
      </main>
      <Footer simpleFooter={true} />
    </main>
  );
}

export default SignInPage;
