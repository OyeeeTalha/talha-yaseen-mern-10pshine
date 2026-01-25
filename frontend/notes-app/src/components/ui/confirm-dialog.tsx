import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning";
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const confirmButtonClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-orange-600 hover:bg-orange-700";

  const iconBgClass =
    variant === "danger" ? "bg-red-500/10" : "bg-orange-500/10";

  const iconColorClass =
    variant === "danger" ? "text-red-500" : "text-orange-500";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-9998 animate-fade-in"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
        <div className="bg-[#1a2332]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md animate-scale-in">
          {/* Icon */}
          <div className="flex justify-center pt-6 pb-4">
            <div
              className={`w-12 h-12 rounded-full ${iconBgClass} flex items-center justify-center`}
            >
              <ErrorOutlineIcon className={iconColorClass} fontSize="large" />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-6 pb-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${confirmButtonClass} rounded-lg transition-colors shadow-lg`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
