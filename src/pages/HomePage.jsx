import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 🧠 Load student data on page load
  useEffect(() => {
    const stored = localStorage.getItem("ccc_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
    }
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      {/* Hero Section */}
      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-10 max-w-3xl w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="College Logo"
            className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-3">
          CCC MOCK TEST
        </h1>

        <p className="text-gray-600 mb-6 text-base sm:text-lg">
          Organized by{" "}
          <span className="font-semibold text-gray-800">
            HIRALAL RAMNIWAS P. G. COLLEGE
          </span>
          <br />
          Practice and prepare for your{" "}
          <strong>Course on Computer Concepts (CCC)</strong> exam with this tests.
        </p>

        {/* 👤 Student Info (Visible after login) */}
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Welcome, {user.name}
            </h2>
            <p className="text-gray-600 text-sm">
              Roll No: <span className="font-medium">{user.rollNumber}</span>
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          {/* Show Login only if not logged in */}
          {!user && (
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-blue-600 text-white text-lg rounded-lg shadow hover:bg-blue-700 transition"
            >
              Student Login
            </button>
          )}

          {/* Start Test */}
          {/* Start Test */}
          <button
            onClick={() => {
              const stored = localStorage.getItem("ccc_user");
              if (!stored) {
                Swal.fire({
                  icon: "warning",
                  title: "Login Required",
                  text: "You need to log in to start the test.",
                  showCancelButton: true,
                  confirmButtonText: "Login Now",
                  cancelButtonText: "Login Later",
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#6c757d",
                  reverseButtons: true,
                }).then((result) => {
                  if (result.isConfirmed) {
                    navigate("/login");
                  }
                });
              } else {
                navigate("/test");
              }
            }}
            className="px-8 py-3 bg-green-600 text-white text-lg rounded-lg shadow hover:bg-green-700 transition"
          >
            Start Test
          </button>

          {/* Logout (Only visible when logged in) */}
          {user && (
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
                    navigate("/");
                    setUser(null);
                    window.location.reload();
                  }
                });
              }}
              className="px-8 py-3 bg-red-600 text-white text-lg rounded-lg shadow hover:bg-red-700 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} HIRALAL RAMNIWAS P. G. COLLEGE — All Rights Reserved.
      </footer>
    </div>
  );
}
