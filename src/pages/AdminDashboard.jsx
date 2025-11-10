import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuestions: 0,
    averageScore: 0,
    highestScore: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("ccc_admin");
    if (!stored) {
      navigate("/admin");
      return;
    }

    const parsed = JSON.parse(stored);
    setAdmin(parsed.user);

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${parsed.token}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, [navigate]);

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-5xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome, <span className="font-semibold">{admin.name}</span> (
          {admin.rollNumber})
        </p>

        {/* 📊 Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-xl shadow text-blue-800">
            <h3 className="text-lg font-semibold">Total Students</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-xl shadow text-green-800">
            <h3 className="text-lg font-semibold">Total Questions</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalQuestions}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-xl shadow text-yellow-800">
            <h3 className="text-lg font-semibold">Average Score</h3>
            <p className="text-3xl font-bold mt-2">{stats.averageScore}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-xl shadow text-purple-800">
            <h3 className="text-lg font-semibold">Highest Score</h3>
            <p className="text-3xl font-bold mt-2">{stats.highestScore}</p>
          </div>
        </div>

        {/* 🔘 Navigation Buttons */}
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">📘 Management</h2>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/admin/add")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                ➕ Add Question
              </button>
              <button
                onClick={() => navigate("/admin/questions")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
              >
                📋 Manage Questions
              </button>
              <button
                onClick={() => navigate("/admin/results")}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition"
              >
                🧾 View Results
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">🧠 Review Section</h2>
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/admin/review")}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
              >
                🔍 View Student Answers
              </button>
            </div>
          </div>
        </div>



        {/* 🚪 Logout */}
        <button
          onClick={() => {
            Swal.fire({
              title: "Logout?",
              text: "Are you sure you want to log out?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Yes, Logout",
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
            }).then((result) => {
              if (result.isConfirmed) {
                localStorage.removeItem("ccc_user");
                navigate("/login");
              }
            });
          }}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
