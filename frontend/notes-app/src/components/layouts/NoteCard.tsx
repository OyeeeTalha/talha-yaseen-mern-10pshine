import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
type NoteCardProps = {
  Title: string;
  Content: string;
  Tags: string[];
  //   CreatedAt: Date;
  //   UpdatedAt: Date;
};

function NoteCard(props: NoteCardProps) {
  return (
    <main className="w-full max-w-[350px]">
      <div className="group relative flex flex-col justify-between p-5 h-48 rounded-2xl bg-linear-to-br from-surface-dark to-[#161f28] border border-white/5 hover:border-primary/30 hover:shadow-lg hover:shadow-black/20 transition-all cursor-pointer">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-white font-semibold text-lg line-clamp-1">
              Q3 Product Strategy
            </h4>
            <div className="material-symbols-outlined text-text-secondary/50 hover:text-white text-[20px] ">
              <MoreHorizRoundedIcon sx={{ fontSize: 30 }} />
            </div>
          </div>
          <p className="text-text-secondary text-sm line-clamp-3 leading-relaxed">
            Focus on user retention and expanding the mobile experience. Key
            metrics include DAU and session length. Meeting notes from Tuesday
            attached.
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">
            Strategy
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span className="text-xs text-text-secondary">2h ago</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default NoteCard;
