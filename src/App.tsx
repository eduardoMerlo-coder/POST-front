import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppRoutes } from "./setup/routes/AppRoutes";
import { AuthProvider } from "./setup/context/AuthContext";
import { ThemeProvider } from "./setup/context/ThemeContext";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
