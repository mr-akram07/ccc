// client/src/pages/AdminAddQuestion.jsx
import { useState, useEffect } from "react";

export default function AdminAddQuestion() {
  const [questionType, setQuestionType] = useState("mcq"); // mcq | truefalse
  const [questionText, setQuestionText] = useState("");
  const [questionTextHi, setQuestionTextHi] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [optionsHi, setOptionsHi] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);
  const [message, setMessage] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Clear message after 3 seconds
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  // 🔹 Auto-fill True/False
  const handleTypeChange = (type) => {
    setQuestionType(type);
    if (type === "truefalse") {
      setOptions(["True", "False"]);
      setOptionsHi(["सही", "गलत"]);
      setCorrectAnswer("");
      setCorrectAnswerIndex(null);
    } else {
      setOptions(["", "", "", ""]);
      setOptionsHi(["", "", "", ""]);
      setCorrectAnswer("");
      setCorrectAnswerIndex(null);
    }
  };

  const handleOptionChange = (index, value, lang = "en") => {
    if (lang === "en") {
      const updated = [...options];
      updated[index] = value;
      setOptions(updated);
    } else {
      const updated = [...optionsHi];
      updated[index] = value;
      setOptionsHi(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const admin = JSON.parse(localStorage.getItem("ccc_admin"));
      if (!admin || !admin.token) {
        alert("⚠️ Please login as admin.");
        return;
      }

      if (!questionText.trim() || options.some((o) => !o.trim())) {
        alert("Please fill all required fields.");
        return;
      }

      const payload = {
        questionText,
        questionTextHi,
        options,
        optionsHi,
        correctAnswer,
        correctAnswerIndex,
      };

      const res = await fetch(`${API_BASE}/api/admin/questions/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${admin.token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (text.startsWith("<!DOCTYPE")) throw new Error("Backend returned HTML");
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message);

      setMessage("✅ Question added successfully!");
      setQuestionText("");
      setQuestionTextHi("");
      if (questionType === "mcq") {
        setOptions(["", "", "", ""]);
        setOptionsHi(["", "", "", ""]);
      }
      setCorrectAnswer("");
      setCorrectAnswerIndex(null);
    } catch (err) {
      console.error("Error adding question:", err);
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">
          Add New Question
        </h1>

        {/* 🔹 Select Question Type */}
        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={() => handleTypeChange("mcq")}
            className={`px-4 py-2 rounded ${
              questionType === "mcq"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Multiple Choice
          </button>
          <button
            onClick={() => handleTypeChange("truefalse")}
            className={`px-4 py-2 rounded ${
              questionType === "truefalse"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            True / False
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* English Question */}
          <div>
            <label className="block font-semibold mb-1">Question (English)</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Enter question in English"
              required
            ></textarea>
          </div>

          {/* Hindi Question */}
          <div>
            <label className="block font-semibold mb-1">Question (Hindi)</label>
            <textarea
              value={questionTextHi}
              onChange={(e) => setQuestionTextHi(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="हिंदी में प्रश्न लिखें"
            ></textarea>
          </div>

          {/* Options (English + Hindi) */}
          <div>
            <label className="block font-semibold mb-2">Options</label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((opt, i) => (
                <div key={i}>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value, "en")}
                    className="w-full border rounded p-2 mb-1"
                    placeholder={`Option ${i + 1} (English)`}
                    required
                  />
                  <input
                    type="text"
                    value={optionsHi[i]}
                    onChange={(e) => handleOptionChange(i, e.target.value, "hi")}
                    className="w-full border rounded p-2"
                    placeholder={`Option ${i + 1} (Hindi)`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Correct Answer */}
          <div>
            <label className="block font-semibold mb-2">Correct Answer</label>
            <select
              value={correctAnswerIndex ?? ""}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setCorrectAnswerIndex(idx);
                setCorrectAnswer(options[idx]);
              }}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select correct answer</option>
              {options.map((opt, i) => (
                <option key={i} value={i}>
                  {opt || `Option ${i + 1}`}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Save Question
            </button>
          </div>
        </form>

        {message && (
          <p className="text-center mt-4 font-semibold text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}