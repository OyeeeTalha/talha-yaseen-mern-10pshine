import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const APP_URL = import.meta.env.VITE_APP_URL;

const fetchCsrfToken = async () => {
  try {
    const csrfResponse = await axios.get(`${API_URL}/csrf`, {
      withCredentials: true,
    });
    const csrfToken = csrfResponse.data.csrfToken;
    console.log("CSRF Token received:", csrfToken);
    return csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
};
export const signout = async () => {
  try {
    const csrfToken = await fetchCsrfToken();

    const formData = new URLSearchParams();
    formData.append("csrfToken", csrfToken);
    formData.append("callbackUrl", `${API_URL}/session`);
    formData.append("json", "true");

    const response = await axios.post(`${API_URL}/signout`, formData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error during sign-out:", error);
    throw error;
  }
};

export const getSession = async () => {
  try {
    const response = await axios.get(`${API_URL}/session`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching session:", error);
    throw error;
  }
};

export const handleGoogleSignIn = async () => {
  try {
    const csrfToken = await fetchCsrfToken();

    const form = document.createElement("form");
    form.method = "POST";

    form.action = `${API_URL}/signin`;

    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "csrfToken";
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    const callbackInput = document.createElement("input");
    callbackInput.type = "hidden";
    callbackInput.name = "callbackUrl";
    callbackInput.value = `${APP_URL}/dashboard`;
    form.appendChild(callbackInput);

    document.body.appendChild(form);
    form.submit();

    document.body.removeChild(form);
  } catch (error) {
    console.error("Sign in failed:", error);
  }
};
