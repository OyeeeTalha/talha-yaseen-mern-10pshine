const VITE_API_URL = import.meta.env.VITE_API_URL;

export interface UserProfile {
  _id: string;
  email: string;
  name: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  avatarBgColor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  avatarBgColor?: string;
}

export const getProfile = async (): Promise<{
  success: boolean;
  data: { user: UserProfile };
}> => {
  const response = await fetch(`${VITE_API_URL}/user/profile`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return await response.json();
};

export const updateProfile = async (
  data: UpdateProfileData,
): Promise<{ success: boolean; data: { user: UserProfile } }> => {
  const response = await fetch(`${VITE_API_URL}/user/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update profile");
  return await response.json();
};

export const deactivateAccount = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await fetch(`${VITE_API_URL}/user/deactivate`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to deactivate account");
  return await response.json();
};

export const reactivateAccount = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await fetch(`${VITE_API_URL}/user/reactivate`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to reactivate account");
  }
  return await response.json();
};

export const submitReactivationRequest = async (
  subject: string,
  message: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${VITE_API_URL}/user/reactivation-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subject, message }),
    credentials: "include",
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to submit request");
  }
  return await response.json();
};

export const getAppConfig = async (): Promise<{
  REACTIVATION_REQUEST_COOLDOWN_SECONDS?: number;
  ACCOUNT_DEACTIVATION_GRACE_PERIOD_SECONDS?: number;
}> => {
  const response = await fetch(`${VITE_API_URL}/config`);
  if (!response.ok) throw new Error("Failed to fetch config");
  return await response.json();
};
