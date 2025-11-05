import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminViewResults() {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("ccc_admin"));
    if (!admin) return navigate("/admin");

    const fetchResults = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/results`, {
          headers: { Authorization: `Bearer ${admin.token}` },
        });
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Error fetching results:", err);
      }
    };

    fetchResults();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-5xl">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          🧾 Student Results
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Roll Number</th>
                <th className="border p-2">Score</th>
                <th className="border p-2">Percentage</th>
                <th className="border p-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, index) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">{index + 1}</td>
                  <td className="border p-2">{r.name}</td>
                  <td className="border p-2">{r.rollNumber}</td>
                  <td className="border p-2 text-center text-blue-600 font-semibold">
                    {r.score}/{r.totalQuestions}
                  </td>
                  <td className="border p-2 text-center text-green-600 font-semibold">
                    {r.percentage}%
                  </td>
                  <td className="border p-2 text-center text-gray-500">
                    {new Date(r.submittedAt).toLocaleString()}
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
    </div>
  );
}
