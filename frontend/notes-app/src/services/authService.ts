import {
  logger,
  logApiRequest,
  logApiResponse,
  logApiError,
} from "@/lib/logger";

const API_URL = import.meta.env.VITE_API_URL;
const APP_URL = import.meta.env.VITE_APP_URL;

const fetchCsrfToken = async () => {
  try {
    logApiRequest("GET", `${API_URL}/auth/csrf`);
    const csrfResponse = await fetch(`${API_URL}/auth/csrf`, {
      credentials: "include",
    });
    logApiResponse("GET", `${API_URL}/auth/csrf`, csrfResponse.status);

    const data = await csrfResponse.json();
    logger.debug({ msg: "CSRF token received", hasToken: !!data.csrfToken });
    return data.csrfToken;
  } catch (error) {
    logApiError("GET", `${API_URL}/auth/csrf`, error as Error);
    throw error;
  }
};

export const signout = async () => {
  try {
    const csrfToken = await fetchCsrfToken();

    const formData = new URLSearchParams();
    formData.append("csrfToken", csrfToken);
    formData.append("callbackUrl", `${API_URL}/auth/session`);
    formData.append("json", "true");

    logApiRequest(
      "POST",
      `${API_URL}/auth/signout`,
      Object.fromEntries(formData),
    );
    const response = await fetch(`${API_URL}/auth/signout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    logApiResponse("POST", `${API_URL}/auth/signout`, response.status);

    return await response.json();
  } catch (error) {
    logApiError("POST", `${API_URL}/auth/signout`, error as Error);
    throw error;
  }
};

export const getSession = async () => {
  try {
    logApiRequest("GET", `${API_URL}/auth/session`);
    const response = await fetch(`${API_URL}/auth/session`, {
      credentials: "include",
    });
    logApiResponse("GET", `${API_URL}/auth/session`, response.status);

    return await response.json();
  } catch (error) {
    logApiError("GET", `${API_URL}/auth/session`, error as Error);
    throw error;
  }
};

export const handleGoogleSignIn = async (callbackUrl?: string) => {
  try {
    const csrfToken = await fetchCsrfToken();

    const form = document.createElement("form");
    form.method = "POST";

    form.action = `${API_URL}/auth/signin`;

    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "csrfToken";
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    const callbackInput = document.createElement("input");
    callbackInput.type = "hidden";
    callbackInput.name = "callbackUrl";
    // Use provided callback or default to dashboard
    callbackInput.value = callbackUrl || `${APP_URL}/dashboard`;
    form.appendChild(callbackInput);

    document.body.appendChild(form);

    logger.info({ msg: "Initiating Google sign-in", callbackUrl: callbackInput.value });
    form.submit();

    document.body.removeChild(form);
  } catch (error) {
    logger.error({ msg: "Google sign-in failed", error });
  }
};
