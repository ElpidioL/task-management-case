//import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { PublicOnlyRoute } from "./components/routing/PublicOnlyRoute";
import { LoginRoutePage } from "./pages/LoginRoutePage";
//import { TasksRoutePage } from "./pages/TasksRoutePage";

function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginRoutePage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/tasks" element={<LoginRoutePage />} />
      </Route>

      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  );
}

export default App;
