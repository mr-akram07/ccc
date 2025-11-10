import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function AdminLoginPage() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber, password }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text || "Unexpected response from server" };
      }

      setLoading(false);

      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message || "Invalid credentials",
          confirmButtonColor: "#1f2937",
        });
        return;
      }

      if (!data.user || data.user.role !== "admin") {
        await Swal.fire({
          icon: "warning",
          title: "Access Denied",
          text: "Only admin accounts can access this page.",
          confirmButtonColor: "#1f2937",
        });
        return;
      }

      localStorage.setItem("ccc_admin", JSON.stringify(data));

      await Swal.fire({
        icon: "success",
        title: "Welcome, Admin!",
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
      });

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#1f2937",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-gray-50 to-white p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Login</h1>

        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
          <input
            type="text"
            placeholder="Admin Roll Number"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="border p-2 rounded-lg focus:ring-2 focus:ring-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded-lg focus:ring-2 focus:ring-gray-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}