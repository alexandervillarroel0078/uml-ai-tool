import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login.jsx";
import HomePage from "./pages/Home.jsx";
import useAuth from "./store/auth.js";

function Protected({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <HomePage />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
