import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppRoutes } from "./setup/routes/AppRoutes";
import { AuthProvider } from "./setup/provider/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
