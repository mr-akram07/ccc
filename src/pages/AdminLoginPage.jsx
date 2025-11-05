import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber, password }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message);

      if (data.user.role !== "admin") {
        setError("Access denied — not an admin");
        return;
      }

      localStorage.setItem("ccc_admin", JSON.stringify(data));
      navigate("/admin/dashboard");
    } catch {
      setError("Login failed");
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
            className="bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
