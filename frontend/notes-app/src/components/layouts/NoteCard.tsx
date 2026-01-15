import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
type NoteCardProps = {
  title: string;
  content: string;
  tags: string[];
  date: string;
  isPinned?: boolean;
  onPinClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

function NoteCard(props: NoteCardProps) {
  const { title, content, tags, date, isPinned, onPinClick, onEdit, onDelete } =
    props;
  return (
    <div className="w-full">
      <div className="group relative flex flex-col justify-between p-5 h-48 rounded-2xl bg-gray-800/50 border border-white/5 hover:border-primary/30 hover:shadow-lg hover:shadow-black/20 transition-all cursor-pointer">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-white font-semibold text-lg line-clamp-1">
              {title}
            </h4>
            <div className="material-symbols-outlined text-gray-400 hover:text-white cursor-pointer">
              <MoreHorizRoundedIcon sx={{ fontSize: 24 }} />
            </div>
          </div>
          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
            {content}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteCard;
