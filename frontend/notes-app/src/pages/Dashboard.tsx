import { useState } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import NoteCard from "@/components/layouts/NoteCard";
import { getGreeting } from "@/lib/utils";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";

type Note = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  date: string;
  isPinned: boolean;
};

// Mock Data
const MOCK_NOTES: Note[] = [
  {
    id: 1,
    title: "Q3 Product Strategy",
    content:
      "Focus on user retention and expanding the mobile experience. Key metrics include DAU and session length. Meeting notes from Tuesday attached.",
    tags: ["Strategy"],
    date: "2h ago",
    isPinned: true,
  },
  {
    id: 2,
    title: "Design System V2",
    content:
      "Updated color palette with new accessible contrast ratios. Icons need to be exported to SVG. Check Figma file...",
    tags: ["Design"],
    date: "Yesterday",
    isPinned: true,
  },
  {
    id: 3,
    title: "Book Ideas 2024",
    content:
      "Sci-fi concept about memory architects. Main character finds a door in a dream that stays open. Need to outline...",
    tags: ["Writing"],
    date: "Oct 24",
    isPinned: true,
  },
  {
    id: 4,
    title: "Grocery List",
    content: "Almond milk, eggs, spinach, coffee beans, dark chocolate, oats.",
    tags: ["Personal"],
    date: "Just now",
    isPinned: false,
  },
  {
    id: 5,
    title: "Workout Plan",
    content:
      "Monday: Chest/Triceps. Tuesday: Back/Biceps. Wednesday: Legs/Core. Thursday: Cardio/Shoulders. Friday: Full Body.",
    tags: ["Health"],
    date: "5h ago",
    isPinned: true,
  },
  {
    id: 6,
    title: "Inspiration Board",
    content:
      "Collected links and images for the new website hero section. Dark mode aesthetics with neon accents.",
    tags: ["Design"],
    date: "Yesterday",
    isPinned: false,
  },
  {
    id: 7,
    title: "Team Meeting Minutes",
    content:
      "Attendance: Sarah, Mike, Jenny. Action items assigned to Mike regarding the server migration. Next meeting on Friday.",
    tags: ["Work"],
    date: "Oct 22",
    isPinned: false,
  },
  {
    id: 8,
    title: "Travel Itinerary: Japan",
    content:
      "Day 1: Tokyo arrival. Day 2: Shibuya & Harajuku. Day 3: Kyoto Shinkansen. Need to book JR Pass.",
    tags: ["Travel"],
    date: "Oct 18",
    isPinned: false,
  },
  {
    id: 9,
    title: "Code Snippets",
    content:
      "Use getDeterministicColor for tag colors to keep them consistent across reloads.",
    tags: ["Dev"],
    date: "Oct 20",
    isPinned: false,
  },
];

function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState("All Notes");
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(false);

  // Filter Logic
  const filteredNotes =
    selectedCategory === "All Notes"
      ? MOCK_NOTES
      : selectedCategory === "Favorites"
      ? MOCK_NOTES.filter((n) => n.isPinned)
      : selectedCategory === "Trash"
      ? [] // Trash logic would go here
      : selectedCategory === "Recent"
      ? MOCK_NOTES.slice(0, 5) // Recent logic demo
      : MOCK_NOTES.filter((n) => n.tags.includes(selectedCategory));

  const pinnedNotes = MOCK_NOTES.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  const displayedPinnedNotes = isPinnedExpanded
    ? pinnedNotes
    : pinnedNotes.slice(0, 3);

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden font-poppins">
      <Sidebar
        activeItem={selectedCategory}
        onItemClick={setSelectedCategory}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 w-full flex items-center justify-between px-8 border-b border-white/5 shrink-0">
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-semibold text-white">
              {getGreeting()}, Talha
            </h1>
            <p className="text-gray-400 text-sm mt-1">Capture your ideas</p>
          </div>
          <div className="relative w-[320px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchRoundedIcon sx={{ fontSize: 22 }} />
            </div>
            <input
              type="text"
              placeholder="Search your notes..."
              className="w-full bg-[#1e293b] text-sm text-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder-gray-500 border border-transparent"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {/* Pinned Section */}
          {selectedCategory !== "Trash" && pinnedNotes.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="flex items-center justify-center text-primary ">
                    <PushPinRoundedIcon sx={{ fontSize: 22 }} />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Pinned
                  </h3>
                </div>
                {pinnedNotes.length > 3 && (
                  <button
                    onClick={() => setIsPinnedExpanded(!isPinnedExpanded)}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {isPinnedExpanded ? "View less" : "View all"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedPinnedNotes.map((note) => (
                  <NoteCard key={note.id} {...note} />
                ))}
              </div>
            </section>
          )}

          {/* Main Notes Section */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-2 text-white">
                <h2 className="text-xl font-bold">{selectedCategory}</h2>
                <span className="text-sm text-gray-500 font-medium ml-1">
                  ({otherNotes.length})
                </span>
              </div>
            </div>

            {selectedCategory === "Trash" ? (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                  <DeleteRoundedIcon
                    className="text-gray-600"
                    sx={{ fontSize: 32 }}
                  />
                </div>
                <h3 className="text-gray-300 font-medium">Trash is empty</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Deleted notes will appear here
                </p>
              </div>
            ) : otherNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherNotes.map((note) => (
                  <NoteCard key={note.id} {...note} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                  <DescriptionRoundedIcon
                    className="text-gray-600"
                    sx={{ fontSize: 32 }}
                  />
                </div>
                <h3 className="text-gray-300 font-medium">No notes found</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Create a new note to get started
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Floating Action Button */}
        <button className="absolute bottom-8 right-8 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-2 font-medium transition-all hover:scale-105 active:scale-95 group z-10">
          <AddRoundedIcon sx={{ fontSize: 24 }} />
          <span>New Note</span>
        </button>
      </main>
    </div>
  );
}

export default Dashboard;
