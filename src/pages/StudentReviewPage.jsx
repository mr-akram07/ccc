import { useEffect, useState } from "react";

export default function StudentReviewPage() {
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      const user = JSON.parse(localStorage.getItem("ccc_user"));
      if (!user || !user.token) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/student/review`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setReviewData(data);
      } catch (err) {
        console.error("Error loading review:", err);
      }
    };
    fetchReview();
  }, []);

  if (!reviewData)
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading review...
      </div>
    );

  const { review, result } = reviewData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Test Review for {result.name} ({result.rollNumber})
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Score: <span className="font-semibold">{result.score}</span> /{" "}
          {result.totalQuestions} ({result.percentage}%)
        </p>

        <div className="space-y-4">
          {review.map((q, i) => (
            <div
              key={i}
              className={`border p-4 rounded-lg ${q.isCorrect ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
                }`}
            >
              <h2 className="font-semibold text-gray-800 mb-2">
                {i + 1}. {q.questionText}
              </h2>
              {q.options.map((opt, j) => (
                <p
                  key={j}
                  className={`p-2 rounded-lg border transition-all ${opt === q.correctAnswer
                    ? "bg-green-200 border-green-400 font-semibold"
                    : opt === q.userAnswer && !q.isCorrect
                      ? "bg-red-200 border-red-400"
                      : "bg-gray-50 border-gray-200"
                    }`}
                >
                  {opt}
                </p>
              ))}
              <p className="mt-2 text-sm">
                <span className="font-semibold text-green-700">✔ Correct:</span> {q.correctAnswer}
              </p>
              <p className="text-sm">
                <span className="font-semibold text-blue-700">🧍 Your Answer:</span>{" "}
                {q.userAnswer || "Not answered"}
              </p>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
