import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rollNumber, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: data.message || "Registration Failed",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "You can now Login.",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-green-50 to-white p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Student Registration
        </h1>

        {message && (
          <p
            className={`p-2 mb-4 rounded ${message.includes("successful")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
              }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Roll Number</label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-gray-600 text-sm mt-6">
          Already registered?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-600 font-medium hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
