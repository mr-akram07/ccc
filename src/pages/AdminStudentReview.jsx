import { useState } from "react";

export default function AdminStudentReview() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [rollNumber, setRollNumber] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!rollNumber.trim()) return alert("Please enter a roll number");

    setLoading(true);
    setError("");
    setData(null);

    try {
      const admin = JSON.parse(localStorage.getItem("ccc_admin"));
      const res = await fetch(
        `${API_BASE}/api/admin/student/${rollNumber}/review`,
        {
          headers: {
            Authorization: `Bearer ${admin.token}`,
          },
        }
      );

      // ✅ Check for backend returning HTML
      const text = await res.text();
      if (text.startsWith("<!DOCTYPE")) {
        throw new Error("Backend returned HTML — check your API base URL");
      }

      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || "Failed to load review");

      setData(data);
    } catch (err) {
      console.error("Error loading review:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center">
        🔍 Student Answer Review
      </h1>

      {/* Search */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Enter Roll Number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          className="border p-2 rounded-l-lg w-64"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-center text-gray-600">Loading...</p>}

      {/* Error */}
      {error && (
        <p className="text-center text-red-500 font-semibold mb-4">{error}</p>
      )}

      {/* Data */}
      {data && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-2">
            Name: {data.student?.name || "N/A"}
          </h2>
          <p className="text-gray-600 mb-4">
            Roll No: {data.student?.rollNumber} | Score: {data.score}/
            {data.totalQuestions} ({data.percentage}%)
          </p>

          <div className="space-y-3">
            {Array.isArray(data.review) && data.review.length > 0 ? (
              data.review.map((q, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <p className="font-semibold text-gray-800">
                    Q{i + 1}: {q.questionText}
                    {q.questionTextHi && (
                      <span className="text-gray-600 block text-sm">
                        ({q.questionTextHi})
                      </span>
                    )}
                  </p>

                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, idx) => (
                      <li
                        key={idx}
                        className={`p-2 rounded ${
                          opt === q.correctAnswer
                            ? "bg-green-100 text-green-700 font-semibold"
                            : opt === q.userAnswer
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100"
                        }`}
                      >
                        {opt}
                        {q.optionsHi?.[idx] && (
                          <span className="text-gray-600 ml-2 text-sm">
                            ({q.optionsHi[idx]})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No answers found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
