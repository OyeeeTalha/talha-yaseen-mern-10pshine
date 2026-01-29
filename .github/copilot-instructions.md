# GitHub Copilot Instructions for This Project

## 🚫 Context & Summary Control

- Do NOT generate summaries, explanations, or paraphrases unless explicitly requested.
- Do NOT create summary files, documentation files, or markdown notes unless explicitly asked.
- Do NOT waste tokens restating the problem, describing obvious code behavior, or explaining standard libraries.
- Use the **minimum necessary context** when generating code or answers.
- Focus strictly on the task requested, nothing more.
- Donot Create or modify .md or similar files unless explicitly instructed.

## 📁 File Creation Rules

- Do NOT create new files unless explicitly instructed.
- Do NOT scaffold folders, boilerplate, or configs unless asked.
- Modify existing files only when requested.

## 🧠 General Behavior

- Prefer clarity and correctness over verbosity.
- Avoid speculative features or “nice-to-have” additions.
- Never assume missing requirements — ask only if absolutely blocking.
- Do not refactor unrelated code.
- Follow existing project patterns and conventions.

---

## ⚛️ MERN Stack Specific Instructions

### Frontend (React)

- Use **functional components only**.
- Prefer **hooks** (`useState`, `useEffect`, `useMemo`, etc.).
- Do NOT introduce state managers (Redux, Zustand, etc.) unless explicitly requested.
- Keep components small and single-responsibility.
- Do not add unnecessary re-renders or premature optimizations.
- Follow existing folder structure (components, hooks, pages, services, etc.).

### Backend (Node.js + Express)

- Use **async/await**, never raw promises.
- Always handle errors properly (try/catch or middleware).
- Do NOT log sensitive data.
- Keep controllers thin; move logic to services if they already exist.
- Follow REST conventions unless instructed otherwise.

### Database (MongoDB + Mongoose)

- Use existing models and schemas.
- Do NOT modify schemas unless explicitly requested.
- Prefer lean queries when returning read-only data.
- Validate input before database operations.

---

## 🔐 Security & Quality

- Never hardcode secrets, tokens, or credentials.
- Assume environment variables are used (`process.env`).
- Sanitize user input where applicable.
- Avoid deprecated APIs and libraries.

---

## 🧪 Testing

- Do NOT add tests unless explicitly requested.
- If modifying code covered by tests, keep behavior consistent.

---

## 🧹 Code Style

- Match existing linting and formatting rules.
- Prefer readable, maintainable code over clever tricks.
- No unnecessary comments; code should be self-explanatory.

---

## ❓ When to Ask Questions

- Ask only if:
  - A requirement is ambiguous **and**
  - A wrong assumption would break functionality

Otherwise, proceed with best judgment aligned to existing code.
