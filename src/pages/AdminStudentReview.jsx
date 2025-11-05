import { useState } from "react";

export default function AdminStudentReview() {
  const [rollNumber, setRollNumber] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const fetchStudentReview = async () => {
    setError("");
    setData(null);
    const admin = JSON.parse(localStorage.getItem("ccc_admin"));
    if (!admin) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/student/${rollNumber}/review`,
        {
          headers: { Authorization: `Bearer ${admin.token}` },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData(json);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-5xl">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          🧾 View Student Answers
        </h1>
        <div className="flex justify-center mb-6 gap-2">
          <input
            type="text"
            placeholder="Enter Roll Number"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="border p-2 rounded w-64"
          />
          <button
            onClick={fetchStudentReview}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {error && <p className="text-center text-red-600">{error}</p>}

        {data && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">
              {data.student} ({data.rollNumber})
            </h2>
            <div className="space-y-3">
              {data.review.map((q, i) => (
                <div
                  key={i}
                  className={`border p-4 rounded-lg ${
                    q.isCorrect
                      ? "bg-green-50 border-green-300"
                      : "bg-red-50 border-red-300"
                  }`}
                >
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {i + 1}. {q.questionText}
                  </h3>
                  {q.options.map((opt, j) => (
                    <p
                      key={j}
                      className={`p-2 rounded ${
                        opt === q.correctAnswer
                          ? "bg-green-100 font-semibold"
                          : opt === q.userAnswer
                          ? "bg-red-100"
                          : ""
                      }`}
                    >
                      {opt}
                    </p>
                  ))}
                  <p className="mt-2 text-sm text-gray-600">
                    Student Answer:{" "}
                    <span
                      className={`font-semibold ${
                        q.isCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {q.userAnswer || "Not answered"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
