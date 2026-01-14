import { Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import LandingPage from "@/pages/Landing-Page";
import SignInPage from "@/pages/SignIn-Page";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
