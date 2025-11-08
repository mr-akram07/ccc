// client/src/pages/AdminViewQuestions.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminViewQuestions() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [questions, setQuestions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    questionText: "",
    questionTextHi: "",
    options: ["", "", "", ""],
    optionsHi: ["", "", "", ""],
    correctAnswer: "",
    correctAnswerIndex: null,
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 🧠 Fetch all questions
  useEffect(() => {
    const fetchQuestions = async () => {
      const admin = JSON.parse(localStorage.getItem("ccc_admin"));
      if (!admin) return navigate("/admin/login");

      try {
        const res = await fetch(`${API_BASE}/api/admin/questions`, {
          headers: { Authorization: `Bearer ${admin.token}` },
        });
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("Error loading questions", err);
      }
    };
    fetchQuestions();
  }, [navigate]);

  // 🗑️ Delete question
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    const admin = JSON.parse(localStorage.getItem("ccc_admin"));

    try {
      const res = await fetch(`${API_BASE}/api/admin/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setQuestions((prev) => prev.filter((q) => q._id !== id));
      setMessage("✅ Question deleted successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  // ✏️ Start Editing
  const startEdit = (q) => {
    setEditing(q._id);
    setEditData({
      questionText: q.questionText,
      questionTextHi: q.questionTextHi || "",
      options: q.options || [],
      optionsHi: q.optionsHi || [],
      correctAnswer: q.correctAnswer || "",
      correctAnswerIndex: q.correctAnswerIndex ?? null,
    });
  };

  // 💾 Update Question
  const handleUpdate = async () => {
    const admin = JSON.parse(localStorage.getItem("ccc_admin"));
    try {
      const res = await fetch(`${API_BASE}/api/admin/questions/${editing}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${admin.token}`,
        },
        body: JSON.stringify(editData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setQuestions((prev) =>
        prev.map((q) => (q._id === editing ? { ...q, ...editData } : q))
      );
      setEditing(null);
      setMessage("✅ Question updated successfully!");
    } catch (err) {
      console.error("Error updating question:", err);
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-2 sm:p-6">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-6xl overflow-x-auto">
        <h1 className="text-lg sm:text-2xl font-bold text-center text-gray-800 mb-3 sm:mb-4">
          📋 Manage Questions
        </h1>

        {message && (
          <p className="text-center text-sm text-gray-700 mb-3">{message}</p>
        )}

        {/* 🧾 Responsive Table */}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border border-gray-300 text-xs sm:text-sm">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                <th className="border p-2 w-8 sm:w-10">#</th>
                <th className="border p-2 text-left">Question (English)</th>
                <th className="border p-2 text-left hidden sm:table-cell">
                  Question (Hindi)
                </th>
                <th className="border p-2 text-center hidden sm:table-cell">
                  Type
                </th>
                <th className="border p-2 text-center">Correct</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => (
                <tr key={q._id} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2 text-gray-800">
                    <p className="font-medium">{q.questionText}</p>
                    <ul className="text-gray-600 text-xs mt-1">
                      {q.options.map((opt, i) => (
                        <li key={i}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="border p-2 text-gray-800 hidden sm:table-cell">
                    {q.questionTextHi || "—"}
                    <ul className="text-gray-600 text-xs mt-1">
                      {q.optionsHi?.map((opt, i) => (
                        <li key={i}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="border p-2 text-center font-semibold text-blue-600 hidden sm:table-cell">
                    {q.options?.length === 2 ? "True / False" : "MCQ"}
                  </td>

                  <td className="border p-2 text-center text-green-700 font-semibold">
                    {q.correctAnswer}
                  </td>

                  <td className="border p-2 text-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => startEdit(q)}
                      className="px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm sm:text-base"
        >
          Back to Dashboard
        </button>
      </div>

      {/* ✏️ Edit Modal (Responsive) */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-md sm:max-w-2xl p-4 sm:p-6 rounded-lg shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-center text-gray-800">
              ✏️ Edit Question
            </h2>

            {/* English */}
            <div className="mb-2">
              <label className="block font-semibold text-xs sm:text-sm mb-1">
                Question (English)
              </label>
              <textarea
                value={editData.questionText}
                onChange={(e) =>
                  setEditData({ ...editData, questionText: e.target.value })
                }
                className="w-full border p-2 rounded text-sm"
                rows={2}
              />
            </div>

            {/* Hindi */}
            <div className="mb-2">
              <label className="block font-semibold text-xs sm:text-sm mb-1">
                Question (Hindi)
              </label>
              <textarea
                value={editData.questionTextHi}
                onChange={(e) =>
                  setEditData({ ...editData, questionTextHi: e.target.value })
                }
                className="w-full border p-2 rounded text-sm"
                rows={2}
              />
            </div>

            {/* Options */}
            <h3 className="font-semibold text-sm sm:text-base mb-2">Options</h3>
            {editData.options.map((opt, i) => (
              <div
                key={i}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2"
              >
                <input
                  value={editData.options[i]}
                  onChange={(e) => {
                    const updated = [...editData.options];
                    updated[i] = e.target.value;
                    setEditData({ ...editData, options: updated });
                  }}
                  placeholder={`Option ${i + 1} (English)`}
                  className="border p-2 rounded text-sm"
                />
                <input
                  value={editData.optionsHi[i] || ""}
                  onChange={(e) => {
                    const updatedHi = [...editData.optionsHi];
                    updatedHi[i] = e.target.value;
                    setEditData({ ...editData, optionsHi: updatedHi });
                  }}
                  placeholder={`Option ${i + 1} (Hindi)`}
                  className="border p-2 rounded text-sm"
                />
              </div>
            ))}

            {/* Correct Answer */}
            <div className="mt-3">
              <label className="block font-semibold text-xs sm:text-sm mb-1">
                Correct Answer
              </label>
              <select
                value={editData.correctAnswerIndex ?? ""}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setEditData({
                    ...editData,
                    correctAnswerIndex: idx,
                    correctAnswer: editData.options[idx],
                  });
                }}
                className="border p-2 rounded w-full text-sm"
              >
                <option value="">Select correct option</option>
                {editData.options.map((opt, i) => (
                  <option key={i} value={i}>
                    {opt || `Option ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
              <button
                onClick={handleUpdate}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}