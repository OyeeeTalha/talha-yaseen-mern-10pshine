import { useState, useRef, useEffect } from "react";
import { getDeterministicColor } from "@/lib/utils"; // Import utils
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import WatchLaterRoundedIcon from "@mui/icons-material/WatchLaterRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { UserAuth } from "@/hooks/userAuth";
import { useNavigate } from "react-router-dom";
import { useGetCategories, useDeleteCategory } from "@/hooks/useCategories";
import { useGetProfile } from "@/hooks/useUser";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { ToastContainer } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type SidebarProps = {
  activeItem: string;
  onItemClick: (item: string) => void;
};

// Avatar URL mapping - using local avatars from public/icons/avatars
const getAvatarUrl = (avatar?: string) => {
  const avatarMap: Record<string, string> = {
    "default-avatar-1": "/icons/avatars/man.png",
    "default-avatar-2": "/icons/avatars/woman.png",
    "default-avatar-3": "/icons/avatars/arab-woman.png",
    "default-avatar-4": "/icons/avatars/doctor.png",
    "default-avatar-5": "/icons/avatars/woman (1).png",
    "default-avatar-6": "/icons/avatars/woman (2).png",
    "default-avatar-7": "/icons/avatars/boy.png",
    "default-avatar-8": "/icons/avatars/boy (1).png",
  };
  return (
    avatarMap[avatar || "default-avatar-1"] || avatarMap["default-avatar-1"]
  );
};

function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const { signout } = UserAuth();
  const navigate = useNavigate();
  const { data: categoriesData } = useGetCategories();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { data: profileData } = useGetProfile();

  // Toast and Confirm hooks
  const { toasts, hideToast, success, error: showError } = useToast();
  const { confirm, isOpen, options, handleConfirm, handleCancel } =
    useConfirm();

  const [contextMenu, setContextMenu] = useState<{
    categoryId: string;
    categoryName: string;
    x: number;
    y: number;
  } | null>(null);

  const longPressTimer = useRef<number | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: "All Notes", icon: DescriptionRoundedIcon },
    { name: "Favorites", icon: StarRoundedIcon },
    { name: "Recent", icon: WatchLaterRoundedIcon },
    { name: "Trash", icon: DeleteRoundedIcon },
  ];

  const categories = categoriesData || [];

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle right-click
  const handleContextMenu = (
    e: React.MouseEvent,
    categoryId: string,
    categoryName: string,
  ) => {
    e.preventDefault();

    // Don't allow context menu on Void category
    if (categoryName.toLowerCase() === "void") return;

    setContextMenu({
      categoryId,
      categoryName,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Handle long press for mobile
  const handleTouchStart = (categoryId: string, categoryName: string) => {
    // Don't allow long press on Void category
    if (categoryName.toLowerCase() === "void") return;

    longPressTimer.current = window.setTimeout(() => {
      const rect = document
        .querySelector(`[data-category-id="${categoryId}"]`)
        ?.getBoundingClientRect();
      if (rect) {
        setContextMenu({
          categoryId,
          categoryName,
          x: rect.right,
          y: rect.top,
        });
      }
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string,
  ) => {
    const confirmed = await confirm({
      title: "Delete this category?",
      message: `Are you sure you want to delete "${categoryName}"?\n\nAll notes in this category will be moved to Void.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (confirmed) {
      deleteCategory(categoryId, {
        onSuccess: () => {
          setContextMenu(null);
          success("Category deleted");
          // If we're viewing the deleted category, switch to All Notes
          if (activeItem === categoryName) {
            onItemClick("All Notes");
          }
        },
        onError: (error: Error) => {
          setContextMenu(null);
          showError(`Failed to delete category: ${error.message}`);
        },
      });
    } else {
      setContextMenu(null);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Logout?",
      message: "Are you sure you want to logout from your account?",
      confirmText: "Logout",
      cancelText: "Cancel",
      variant: "warning",
    });

    if (confirmed) {
      signout(undefined, {
        onSuccess: () => {
          navigate("/");
        },
      });
    }
  };

  return (
    <div className="hidden md:flex flex-col w-[280px] h-full border-r border-white/5 bg-[#111a22] shrink-0 p-4 justify-start gap-10">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={hideToast} />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <div className="w-full justify-between items-center gap-3 inline-flex">
        <div
          className="absolute w-10 h-10 border-2 border-solid border-sky-600 flex justify-center items-center rounded-full"
          style={{
            backgroundColor:
              profileData?.data?.user?.avatarBgColor || "#60a5fa",
          }}
        >
          <img
            src={getAvatarUrl(profileData?.data?.user?.avatar)}
            alt="Profile avatar"
            className="w-full h-full object-cover rounded-full"
          />
          <span className="bottom-0 left-7 absolute  w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>
        <div className="relative flex flex-col items-start pl-14">
          <span className="text-white text-base font-semibold leading-tight line-clamp-1">
            {profileData?.data?.user?.name || "User"}
          </span>
          <span className="text-text-secondary text-xs font-medium">
            @{profileData?.data?.user?.displayName || "user"}
          </span>
        </div>
      </div>
      <div className="w-full">
        <ul className="flex-col gap-1 flex">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard");
                  onItemClick(item.name);
                }}
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all cursor-pointer ${
                    activeItem === item.name
                      ? "bg-primary/10 text-primary"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <div className="h-5 gap-3 flex">
                    <div
                      className={`flex items-center justify-center ${
                        activeItem === item.name ? "text-primary" : "text-white"
                      }`}
                    >
                      <item.icon sx={{ fontSize: 20 }} />
                    </div>
                    <h2 className="text-sm font-medium leading-snug">
                      {item.name}
                    </h2>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Categories Section */}
      <div className="w-full flex-col flex flex-1 overflow-y-auto min-h-0">
        <div className="h-8 px-3 items-center inline-flex shrink-0">
          <h6 className="text-gray-500 text-xs font-bold leading-4 tracking-wider">
            CATEGORIES
          </h6>
        </div>
        <ul className="flex-col gap-1 flex">
          {categories
            .filter((category) => category.name.toLowerCase() !== "void")
            .map((category) => (
              <li key={category.id}>
                <div
                  data-category-id={category.id}
                  onContextMenu={(e) =>
                    handleContextMenu(e, category.id, category.name)
                  }
                  onTouchStart={() =>
                    handleTouchStart(category.id, category.name)
                  }
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/dashboard");
                      onItemClick(category.name);
                    }}
                  >
                    <div
                      className={`flex items-center gap-1 px-3 py-2.5 rounded-lg group transition-all cursor-pointer ${
                        activeItem === category.name
                          ? "bg-primary/10 text-primary"
                          : "text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="h-5 gap-3 flex items-center w-full">
                        <div className="flex items-center justify-center">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: getDeterministicColor(
                                category.index,
                              ),
                            }}
                          ></span>
                        </div>
                        <h2
                          className={`text-sm font-medium leading-snug ${
                            activeItem === category.name
                              ? "text-primary"
                              : "text-gray-400 group-hover:text-white"
                          }`}
                        >
                          {category.name}
                        </h2>
                      </div>
                    </div>
                  </a>
                </div>
              </li>
            ))}
        </ul>
      </div>

      <div className="w-full flex-col flex border-t border-white/5 mt-auto">
        <ul className="flex-col gap-1 flex">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/profile");
              }}
            >
              <div className="p-3 rounded-lg items-center inline-flex hover:bg-white/5 transition-colors cursor-pointer">
                <div className="h-5 items-center gap-3 flex">
                  <div className="flex items-center justify-center text-primary ">
                    <SettingsRoundedIcon sx={{ fontSize: 20 }} />
                  </div>
                  <h2 className="text-gray-500 text-sm font-medium leading-snug">
                    Settings
                  </h2>
                </div>
              </div>
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <div className="p-3 rounded-lg items-center inline-flex">
                <div className="h-5 items-center gap-3 flex">
                  <div className="flex items-center justify-center text-primary ">
                    <LogoutRoundedIcon sx={{ fontSize: 20 }} />
                  </div>
                  <h2 className="text-gray-500 text-sm font-medium leading-snug">
                    Logout
                  </h2>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </div>

      {/* Context Menu for Category Deletion */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-gray-800 border border-white/10 rounded-lg shadow-xl shadow-black/50 z-9999 min-w-40"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={() =>
              handleDeleteCategory(
                contextMenu.categoryId,
                contextMenu.categoryName,
              )
            }
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-lg"
          >
            <DeleteRoundedIcon sx={{ fontSize: 18 }} />
            <span>Delete Category</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
