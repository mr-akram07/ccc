import { useState } from "react";

export default function AdminAddQuestion() {

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);

  const [questionTextHi, setQuestionTextHi] = useState("");
  const [optionsHi, setOptionsHi] = useState(["", "", "", ""]);

  const handleOptionChange = (index, value, lang = "en") => {
    if (lang === "hi") {
      const newOpts = [...optionsHi];
      newOpts[index] = value;
      setOptionsHi(newOpts);
    } else {
      const newOpts = [...options];
      newOpts[index] = value;
      setOptions(newOpts);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const admin = JSON.parse(localStorage.getItem("ccc_admin"));
    if (!admin) return alert("Not logged in");

    const payload = {
      questionText,
      options,
      correctAnswer,
      correctAnswerIndex,
      questionTextHi,
      optionsHi,
    };

    try {
      const res = await fetch(`${API_BASE}/api/admin/questions/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${admin.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Question added successfully");
        setQuestionText("");
        setQuestionTextHi("");
        setOptions(["", "", "", ""]);
        setOptionsHi(["", "", "", ""]);
        setCorrectAnswer("");
        setCorrectAnswerIndex(null);
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      console.error("Error submitting:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4 text-center">🧠 Add Bilingual Question</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* English question */}
        <div>
          <label className="block font-semibold">Question (English)</label>
          <input
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Hindi question */}
        <div>
          <label className="block font-semibold">Question (Hindi)</label>
          <input
            value={questionTextHi}
            onChange={(e) => setQuestionTextHi(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Optional"
          />
        </div>

        {/* Options (English + Hindi side by side) */}
        {options.map((opt, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              placeholder={`Option ${i + 1} (English)`}
              value={options[i]}
              onChange={(e) => handleOptionChange(i, e.target.value, "en")}
              className="border p-2 rounded"
              required
            />
            <input
              placeholder={`Option ${i + 1} (Hindi)`}
              value={optionsHi[i]}
              onChange={(e) => handleOptionChange(i, e.target.value, "hi")}
              className="border p-2 rounded"
            />
          </div>
        ))}

        {/* Correct Answer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block font-semibold">Correct Answer (English text)</label>
            <input
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">Correct Answer Index (0–3)</label>
            <input
              type="number"
              min="0"
              max="3"
              value={correctAnswerIndex ?? ""}
              onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))}
              className="border p-2 rounded w-full"
              placeholder="Optional"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Question
        </button>
      </form>
    </div>
  );
}
