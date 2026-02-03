import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layouts/Sidebar";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import {
  useGetProfile,
  useUpdateProfile,
  useDeactivateAccount,
} from "@/hooks/useUser";
import { UserAuth } from "@/hooks/userAuth";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { ToastContainer } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// Available avatar options
const AVATAR_OPTIONS = [
  "default-avatar-1",
  "default-avatar-2",
  "default-avatar-3",
  "default-avatar-4",
  "default-avatar-5",
  "default-avatar-6",
  "default-avatar-7",
  "default-avatar-8",
];

// Background color options - distinct and clearly different colors
const AVATAR_BG_COLORS = [
  { name: "Sky Blue", value: "#3b82f6" }, // Bright blue
  { name: "Emerald", value: "#10b981" }, // Green
  { name: "Rose", value: "#f43f5e" }, // Red/Pink
  { name: "Amber", value: "#f59e0b" }, // Orange/Yellow
  { name: "Purple", value: "#a855f7" }, // Purple
  { name: "Cyan", value: "#06b6d4" }, // Cyan/Teal
  { name: "Fuchsia", value: "#d946ef" }, // Magenta
  { name: "Lime", value: "#84cc16" }, // Lime green
  { name: "Slate", value: "#64748b" }, // Gray/Blue
  { name: "Coral", value: "#ff6b6b" }, // Coral red
];

// Avatar URL mapping - using local avatars from public/icons/avatars
const getAvatarUrl = (avatar: string) => {
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
  return avatarMap[avatar] || avatarMap["default-avatar-1"];
};

function ProfilePage() {
  const navigate = useNavigate();
  const { signout } = UserAuth();
  const { data: profileData, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const deactivateAccount = useDeactivateAccount();

  // Toast and Confirm hooks
  const { toasts, hideToast, success, error: showError } = useToast();
  const { confirm, isOpen, options, handleConfirm, handleCancel } =
    useConfirm();

  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    bio: "",
    avatar: "default-avatar-1",
    avatarBgColor: "#60a5fa",
  });

  const [activeSidebarItem, setActiveSidebarItem] = useState("Settings");

  useEffect(() => {
    if (profileData?.data?.user) {
      const user = profileData.data.user;
      setFormData({
        displayName: user.displayName || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        avatar: user.avatar || "default-avatar-1",
        avatarBgColor: user.avatarBgColor || "#60a5fa",
      });
    }
  }, [profileData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (avatar: string) => {
    setFormData((prev) => ({ ...prev, avatar }));
    setShowAvatarSelector(false);
  };

  const handleSaveChanges = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      success("Profile updated successfully");
    } catch (error: any) {
      showError(`Failed to update profile: ${error.message}`);
    }
  };

  const handleDiscard = () => {
    if (profileData?.data?.user) {
      const user = profileData.data.user;
      setFormData({
        displayName: user.displayName || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        avatar: user.avatar || "default-avatar-1",
        avatarBgColor: user.avatarBgColor || "#60a5fa",
      });
    }
  };

  const handleDeactivate = async () => {
    const confirmed = await confirm({
      title: "Deactivate Account",
      message:
        "Are you sure you want to deactivate your account? Your data will be kept for 30 days, after which it will be permanently deleted. You can restore your account by logging in during this period.",
      confirmText: "Deactivate Account",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (confirmed) {
      try {
        await deactivateAccount.mutateAsync();
        success("Account deactivated successfully");
        await signout();
        navigate("/");
      } catch (error: any) {
        showError(`Failed to deactivate account: ${error.message}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#0d1117] items-center justify-center">
        <Loading />
      </div>
    );
  }

  const user = profileData?.data?.user;

  return (
    <div className="flex h-screen bg-[#0d1117] text-white overflow-hidden font-poppins">
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

      <Sidebar
        activeItem={activeSidebarItem}
        onItemClick={setActiveSidebarItem}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <div className="max-w-[600px] mx-auto w-full p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-white mb-2">Profile</h1>
            <p className="text-gray-400">
              Manage your personal information and account.
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-[#1a1f2e] rounded-xl p-8 border border-white/5">
            {/* Avatar Section */}
            <div className="flex items-start gap-6 mb-8">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 flex items-center justify-center"
                  style={{ backgroundColor: formData.avatarBgColor }}
                >
                  <img
                    src={getAvatarUrl(formData.avatar)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-[#1a1f2e] rounded-full"></span>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-1">
                  {user?.name || "User"}
                </h2>
                <p className="text-gray-400 text-sm mb-4">{user?.email}</p>
                <Button
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm transition-all"
                >
                  <EditRoundedIcon sx={{ fontSize: 18 }} />
                  Edit Photo
                </Button>
              </div>
            </div>

            {/* Avatar Selector */}
            {showAvatarSelector && (
              <div className="mb-6 p-6 bg-[#0d1117] rounded-lg border border-white/10">
                <h3 className="text-sm font-medium text-gray-300 mb-4">
                  Choose an avatar
                </h3>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => handleAvatarSelect(avatar)}
                      className={`w-20 h-20 rounded-full overflow-hidden border-3 transition-all hover:scale-105 hover:shadow-xl ${
                        formData.avatar === avatar
                          ? "border-primary shadow-lg shadow-primary/50 ring-2 ring-primary/30"
                          : "border-white/10 hover:border-primary/40"
                      }`}
                    >
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: formData.avatarBgColor }}
                      >
                        <img
                          src={getAvatarUrl(avatar)}
                          alt={avatar}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  Background Color
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {AVATAR_BG_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          avatarBgColor: color.value,
                        }))
                      }
                      className={`w-full h-12 rounded-lg transition-all hover:scale-105 ${
                        formData.avatarBgColor === color.value
                          ? "ring-2 ring-white/50 ring-offset-2 ring-offset-[#0d1117] shadow-lg"
                          : "hover:ring-2 hover:ring-white/30"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {formData.avatarBgColor === color.value && (
                        <span className="text-white text-2xl">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Display Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="This is how your name will be displayed to other users."
                className="w-full px-4 py-3 bg-[#0d1117] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is how your name will be displayed to other users.
              </p>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Alex"
                  className="w-full px-4 py-3 bg-[#0d1117] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="w-full px-4 py-3 bg-[#0d1117] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-[#0d1117] border border-white/10 rounded-lg text-gray-500 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{user?.email}</span>
                </div>
                <button className="px-4 py-3 bg-white/5 text-gray-400 rounded-lg text-sm cursor-not-allowed">
                  OAuth
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Linked to your Google account. Contact support to change.
              </p>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Product Designer focusing on clean UIs and design systems."
                rows={4}
                className="w-full px-4 py-3 bg-[#0d1117] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <Button
                onClick={handleDiscard}
                className="px-6 py-2.5 bg-transparent hover:bg-white/5 text-gray-400 rounded-lg text-sm font-medium transition-all"
              >
                Discard
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={updateProfile.isPending}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 bg-red-950/20 rounded-xl p-6 border border-red-500/20">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Danger Zone
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Once you deactivate your account, there is no going back. Please
              be certain.
            </p>
            <Button
              onClick={handleDeactivate}
              disabled={deactivateAccount.isPending}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              {deactivateAccount.isPending
                ? "Deactivating..."
                : "Deactivate Account"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
