// client/src/pages/AdminViewResults.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminViewResults() {
  const [results, setResults] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("percentage");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [average, setAverage] = useState(0);
  const [topper, setTopper] = useState(null);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const admin = JSON.parse(localStorage.getItem("ccc_admin"));
        if (!admin || !admin.token) {
          alert("⚠️ Please login as admin.");
          navigate("/admin/login");
          return;
        }

        const res = await fetch(`${API_BASE}/api/admin/results`, {
          headers: { Authorization: `Bearer ${admin.token}` },
        });

        const text = await res.text();
        if (text.startsWith("<!DOCTYPE")) {
          throw new Error("Backend returned HTML — check API URL");
        }

        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data.message || "Failed to load results");

        if (!Array.isArray(data) || !data.length) {
          setResults([]);
          setFiltered([]);
          setLoading(false);
          return;
        }

        const sorted = [...data].sort(
          (a, b) => Number(b.percentage) - Number(a.percentage)
        );
        const top = sorted[0];
        const avg =
          sorted.reduce(
            (sum, r) => sum + (Number(r.percentage) || 0),
            0
          ) / sorted.length;

        setResults(sorted);
        setFiltered(sorted);
        setTopper(top);
        setAverage(avg.toFixed(2));
        setLoading(false);
      } catch (err) {
        console.error("Error loading results:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchResults();
  }, [API_BASE, navigate]);

  // 🔍 Filter results dynamically
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(results);
      return;
    }

    const term = search.toLowerCase();
    const filteredData = results.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.rollNumber.toLowerCase().includes(term)
    );
    setFiltered(filteredData);
  }, [search, results]);

  // 📊 Sort results
  useEffect(() => {
    let sorted = [...filtered];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "percentage") {
      sorted.sort((a, b) => Number(b.percentage) - Number(a.percentage));
    } else if (sortBy === "date") {
      sorted.sort(
        (a, b) =>
          new Date(b.submittedAt || 0).getTime() -
          new Date(a.submittedAt || 0).getTime()
      );
    }
    setFiltered(sorted);
  }, [sortBy]);

  // 🧾 Export as CSV
  const exportCSV = () => {
    if (!filtered.length) {
      alert("No results to export!");
      return;
    }

    const headers = [
      "Name",
      "Roll Number",
      "Score",
      "Total Questions",
      "Percentage",
      "Submitted At",
    ];

    const rows = filtered.map((r) => [
      r.name,
      r.rollNumber,
      r.score,
      r.totalQuestions,
      r.percentage + "%",
      r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "CCC_Student_Results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Loading results...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">
          Student Results
        </h1>

        {results.length === 0 ? (
          <p className="text-center text-gray-600">No results available.</p>
        ) : (
          <>
            {/* 📊 Stats Summary */}
            <div className="flex flex-col sm:flex-row justify-around items-center mb-6 bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-700">
                Total Students: {results.length}
              </p>
              <p className="font-semibold text-green-700">
                Average Percentage: {average}%
              </p>
              {topper && (
                <p className="font-semibold text-yellow-600">
                  Topper: {topper.name} ({topper.percentage}%)
                </p>
              )}
            </div>

            {/* 🔍 Search + Sort + Export */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or roll number..."
                className="border rounded px-4 py-2 w-full sm:w-1/2 shadow-sm focus:ring-2 focus:ring-blue-400"
              />

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-400"
                >
                  <option value="percentage">Sort by Percentage</option>
                  <option value="name">Sort by Name</option>
                  <option value="date">Sort by Date</option>
                </select>

                <button
                  onClick={exportCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* 🧾 Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 rounded-lg shadow-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border text-left">#</th>
                    <th className="p-2 border text-left">Name</th>
                    <th className="p-2 border text-left">Roll Number</th>
                    <th className="p-2 border text-center">Score</th>
                    <th className="p-2 border text-center">Total</th>
                    <th className="p-2 border text-center">Percentage</th>
                    <th className="p-2 border text-center">Date</th>
                    <th className="p-2 border text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center text-gray-500 py-4"
                      >
                        No matching records found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, index) => (
                      <tr
                        key={r._id}
                        className={`text-center border-t ${topper && r._id === topper._id
                          ? "bg-yellow-100 font-semibold"
                          : "hover:bg-gray-50"
                          }`}
                      >
                        <td className="p-2 border">{index + 1}</td>
                        <td className="p-2 border text-left">{r.name}</td>
                        <td className="p-2 border text-left">{r.rollNumber}</td>
                        <td className="p-2 border">{r.score}</td>
                        <td className="p-2 border">{r.totalQuestions}</td>
                        <td
                          className={`p-2 border font-semibold ${r.percentage >= 75
                            ? "text-green-600"
                            : r.percentage >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                            }`}
                        >
                          {r.percentage}%
                        </td>
                        <td className="p-2 border text-gray-600">
                          {r.submittedAt
                            ? new Date(r.submittedAt).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="p-2 border">
                          <button
                            onClick={() =>
                              navigate("/admin/review", { state: { rollNumber: r.rollNumber } })
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm sm:text-base"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}