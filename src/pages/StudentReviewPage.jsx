// client/src/pages/StudentReviewPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentReviewPage() {

  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const student = JSON.parse(localStorage.getItem("ccc_user"));
        if (!student || !student.token) {
          alert("⚠️ Please login first to view your test review.");
          navigate("/login");
          return;
        }

        const res = await fetch(`${API_BASE}/api/student/review`, {
          headers: {
            Authorization: `Bearer ${student.token}`,
          },
        });

        const text = await res.text();
        if (text.startsWith("<!DOCTYPE")) {
          throw new Error("Backend returned HTML — check VITE_API_BASE_URL");
        }

        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data.message || "Failed to load review");

        setReviewData(data);
        setLoading(false);
      } catch (err) {
        console.error("Review fetch error:", err);
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchReview();
  }, [navigate, API_BASE]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your review...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!reviewData || !Array.isArray(reviewData.review) || !reviewData.review.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <h2 className="text-xl font-semibold mb-2">No Review Data Found</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-2 text-center text-blue-700">
          Test Review
        </h1>
        <p className="text-center mb-6 text-gray-700">
          Score: <b>{reviewData.score}</b> / {reviewData.totalQuestions} (
          {reviewData.percentage}%)
        </p>

        <div className="space-y-4">
          {reviewData.review.map((q, i) => (
            <div
              key={i}
              className={`p-4 border rounded-lg ${
                q.isCorrect ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"
              }`}
            >
              <p className="font-semibold text-gray-800 mb-2">
                Q{i + 1}: {q.questionText}
              </p>
              <ul className="space-y-1">
                {q.options.map((opt, idx) => (
                  <li
                    key={idx}
                    className={`p-2 rounded ${
                      opt === q.correctAnswer
                        ? "bg-green-200 text-green-800 font-medium"
                        : opt === q.userAnswer
                        ? "bg-red-200 text-red-800"
                        : "bg-gray-100"
                    }`}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}