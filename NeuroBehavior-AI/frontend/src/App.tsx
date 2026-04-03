import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import TypingTest from "./pages/TypingTest";
import AttentionTest from "./pages/AttentionTest";
import ReadingTest from "./pages/ReadingTest";
import Dashboard from "./pages/Dashboard";
import FinalResult from "./pages/FinalResult";
import History from "./pages/History";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-200">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/typing-test"
            element={
              <ProtectedRoute>
                <TypingTest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attention-test"
            element={
              <ProtectedRoute>
                <AttentionTest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reading-test"
            element={
              <ProtectedRoute>
                <ReadingTest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/final-result"
            element={
              <ProtectedRoute>
                <FinalResult />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
