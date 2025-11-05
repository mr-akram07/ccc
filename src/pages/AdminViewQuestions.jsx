import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminViewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 🧠 Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      const admin = JSON.parse(localStorage.getItem("ccc_admin"));
      if (!admin) return navigate("/admin");

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/questions`, {
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

  // 🗑️ Delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    const admin = JSON.parse(localStorage.getItem("ccc_admin"));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/question/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${admin.token}` },
      });
      const data = await res.json();
      setMessage(data.message);
      setQuestions(questions.filter((q) => q._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ✏️ Start Editing
  const startEdit = (q) => {
    setEditing(q._id);
    setEditData({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
    });
  };

  // 🧾 Save Edited Question
  const handleUpdate = async () => {
    const admin = JSON.parse(localStorage.getItem("ccc_admin"));
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/question/${editing}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${admin.token}`,
          },
          body: JSON.stringify(editData),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setQuestions((prev) =>
        prev.map((q) => (q._id === editing ? data.updated : q))
      );
      setMessage("✅ Question updated successfully!");
      setEditing(null);
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-5xl">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          📋 Manage Questions
        </h1>

        {message && (
          <p className="text-center text-sm text-gray-700 mb-4">{message}</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2 text-left">Question</th>
                <th className="border p-2">Correct</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => (
                <tr key={q._id} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{q.questionText}</td>
                  <td className="border p-2 text-center text-green-600 font-semibold">
                    {q.correctAnswer}
                  </td>
                  <td className="border p-2 text-center space-x-2">
                    <button
                      onClick={() => startEdit(q)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
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
          className="mt-6 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Back to Dashboard
        </button>
      </div>

      {/* ✏️ Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">
              Edit Question
            </h2>
            <textarea
              value={editData.questionText}
              onChange={(e) =>
                setEditData({ ...editData, questionText: e.target.value })
              }
              className="w-full border p-2 rounded mb-3"
            />
            {editData.options.map((opt, i) => (
              <input
                key={i}
                value={opt}
                onChange={(e) => {
                  const updated = [...editData.options];
                  updated[i] = e.target.value;
                  setEditData({ ...editData, options: updated });
                }}
                className="w-full border p-2 rounded mb-2"
                placeholder={`Option ${i + 1}`}
              />
            ))}
            <input
              type="text"
              value={editData.correctAnswer}
              onChange={(e) =>
                setEditData({ ...editData, correctAnswer: e.target.value })
              }
              className="w-full border p-2 rounded mb-4"
              placeholder="Correct Answer"
            />
            <div className="flex justify-between">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
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
