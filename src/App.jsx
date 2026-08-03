import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import Auth from "./pages/Auth.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { ToastProvider } from "./components/Toast.jsx";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
