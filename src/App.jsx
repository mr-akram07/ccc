import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TestPage from "./pages/TestPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAddQuestion from "./pages/AdminAddQuestion";
import AdminViewQuestions from "./pages/AdminViewQuestions";
import AdminViewResults from "./pages/AdminViewResults";
import StudentReviewPage from "./pages/StudentReviewPage"
import AdminStudentReview from "./pages/AdminStudentReview";


function App() {
  return (
    <Router>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/review" element={<StudentReviewPage />} />
        <Route
          path="/test"
          element={
            <ProtectedRoute>
              <TestPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/results" element={<AdminViewResults />} />
        <Route path="/admin/student-review" element={<AdminStudentReview />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/add" element={<AdminAddQuestion />} />
        <Route path="/admin/questions" element={<AdminViewQuestions />} />
      </Routes>
    </Router>
  );
}

export default App;
