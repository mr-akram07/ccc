import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminAddQuestion() {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("ccc_admin");
    if (!admin) navigate("/admin");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const admin = JSON.parse(localStorage.getItem("ccc_admin"));
    if (!admin) return navigate("/admin/login");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${admin.token}`,
        },
        body: JSON.stringify({ questionText, options, correctAnswer }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage("✅ Question added successfully!");
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  const handleOptionChange = (value, index) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 text-center">
          ➕ Add New Question
        </h1>

        {message && (
          <p className="text-center mb-4 font-medium text-gray-700">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            placeholder="Enter question text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />

          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(e.target.value, i)}
              required
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            />
          ))}

          <input
            type="text"
            placeholder="Correct Answer (e.g. Option A)"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            required
            className="border rounded-lg p-2 focus:ring-2 focus:ring-green-500"
          />

          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add Question
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="mt-2 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
          >
            Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
