// client/src/pages/TestPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/*
 Final stable TestPage:
 - fetches questions from backend
 - bilingual (questionText / questionTextHi + options / optionsHi)
 - saves answers as indices
 - autosaves to localStorage
 - checks login (ccc_user)
 - submits to /api/student/submit
*/

export default function TestPage() {
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const STORAGE_KEY = "ccc_test_data_v2";
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 30);
  const [submitted, setSubmitted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Ensure user is logged in (uses ccc_user key)
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("ccc_user"));
    if (!u || !u.token) {
      alert("⚠️ Please log in first to attempt the test.");
      navigate("/login");
    }
  }, [navigate]);

  // Load saved progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (Array.isArray(parsed.answers)) setAnswers(parsed.answers);
          if (typeof parsed.current === "number") setCurrent(parsed.current);
          if (typeof parsed.timeLeft === "number") setTimeLeft(parsed.timeLeft);
          if (parsed.submitted) setSubmitted(true);
        }
      }
    } catch (err) {
      console.error("Failed to load saved test:", err);
    }
  }, []);

  // Fetch questions from backend
  useEffect(() => {
    let mounted = true;
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const res = await fetch(`${API_BASE}/api/student/questions`);
        // handle HTML being returned (wrong base url)
        const text = await res.text();
        if (text.startsWith("<!DOCTYPE")) {
          throw new Error("Backend returned HTML — check VITE_API_BASE_URL");
        }
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error("Invalid questions data");

        const normalized = data.map((q) => {
          const nq = { ...q };
          if (typeof nq.correctAnswerIndex === "number") {
            // ok
          } else if (nq.correctAnswer) {
            const idx = Array.isArray(nq.options) ? nq.options.findIndex((o) => String(o).trim() === String(nq.correctAnswer).trim()) : -1;
            nq.correctAnswerIndex = idx >= 0 ? idx : null;
          } else {
            nq.correctAnswerIndex = null;
          }
          return nq;
        });

        if (!mounted) return;
        setQuestions(normalized);

        // ensure answers array matches length
        setAnswers((prev) => {
          const arr = Array(normalized.length).fill(null);
          for (let i = 0; i < Math.min(prev.length, normalized.length); i++) arr[i] = prev[i];
          return arr;
        });

        setLoadingQuestions(false);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError(err.message || "Failed to load questions");
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
    return () => (mounted = false);
  }, [API_BASE]);

  // Autosave to localStorage frequently and on changes
  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, current, timeLeft, submitted }));
      } catch (err) {
        console.error("Autosave error:", err);
      }
    };
    save();
    const id = setInterval(save, 5000);
    return () => clearInterval(id);
  }, [answers, current, timeLeft, submitted]);

  // Timer
  useEffect(() => {
    if (submitted || loadingQuestions) return;
    if (timeLeft <= 0) {
      // auto-submit
      handleSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, submitted, loadingQuestions]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" + sec : sec}`;
  };

  const selectAnswer = (qIndex, optIndex) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[qIndex] = optIndex;
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("ccc_user"));
      if (!user || !user.token) {
        alert("Session expired — please log in again.");
        navigate("/login");
        return;
      }

      // Submit answers as indices (server should accept this form)
      const payload = { answers };

      const res = await fetch(`${API_BASE}/api/student/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (text.startsWith("<!DOCTYPE")) throw new Error("Backend returned HTML — check VITE_API_BASE_URL");
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || "Submission failed");

      // Save summary locally (score calculation can be done by backend; if backend returns result use it)
      if (data.score != null && data.totalQuestions != null) {
        const obj = { answers, submitted: true, score: data.score, totalQuestions: data.totalQuestions, percentage: data.percentage ?? null };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, submitted: true }));
      }

      setSubmitted(true);
      alert("✅ Test submitted successfully!");
      // redirect to review page (student review)
      navigate("/review");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Submission error: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // UI safe guards
  if (loadingQuestions) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading questions...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">Error: {error}</div>;
  }

  if (!questions.length) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">No questions available.</div>;
  }

  if (submitted) {
    const stored = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } })();
    const score = stored?.score ?? null;
    const total = stored?.totalQuestions ?? questions.length;
    const percent = stored?.percentage ?? (score != null ? Math.round((score / total) * 100) : null);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center max-w-xl w-full">
          <h1 className="text-2xl font-bold mb-3 text-green-700">Test Submitted ✅</h1>
          <p className="mb-2">Total Questions: {total}</p>
          {score != null && <p className="mb-2">Score: {score}</p>}
          {percent != null && <p className="mb-2">Percentage: {percent}%</p>}
          <p className="text-sm text-gray-600">You cannot retake the test.</p>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const total = questions.length;
  const selectedIndex = answers[current] ?? null;

  const getQuestionText = (qObj, lang = "en") => (lang === "hi" ? (qObj?.questionTextHi || qObj?.questionText || "") : (qObj?.questionText || ""));
  const getOptions = (qObj, lang = "en") => (lang === "hi" ? (Array.isArray(qObj?.optionsHi) && qObj.optionsHi.length ? qObj.optionsHi : (Array.isArray(qObj?.options) ? qObj.options : [])) : (Array.isArray(qObj?.options) ? qObj.options : []));

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-white p-4 rounded shadow mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">CCC Mock Test</h1>
          <p className="text-sm text-gray-600">
            {(() => {
              const u = JSON.parse(localStorage.getItem("ccc_user"));
              return u?.user ? `Welcome, ${u.user.name} (${u.user.rollNumber})` : "";
            })()}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-red-600 font-semibold">Time Left: {formatTime(timeLeft)}</div>
          <button onClick={() => { localStorage.removeItem("ccc_user"); navigate("/login"); }} className="bg-red-600 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <section className="bg-white rounded shadow p-4">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-semibold">Question {current + 1} of {total}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">← Previous</button>
              <button onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))} disabled={current === total - 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next →</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">English</h3>
              <div className="border rounded p-3 min-h-40">
                <p className="mb-3 text-gray-700">{getQuestionText(q, "en") || <span className="text-gray-400">No English text</span>}</p>
                <div
                  className={`grid ${getOptions(q, "en").length <= 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1"
                    } gap-2`}
                >
                  {getOptions(q, "en").map((opt, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <label
                        key={idx}
                        className={`flex items-center p-2 border rounded cursor-pointer transition ${isSelected
                            ? "bg-blue-500 text-white border-blue-600"
                            : "hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => selectAnswer(current, idx)}
                          className="mr-2 accent-blue-600"
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>

              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">Hindi</h3>
              <div className="border rounded p-3 min-h-40">
                <p className="mb-3 text-gray-700">{getQuestionText(q, "hi") || <span className="text-gray-400">No Hindi text</span>}</p>
                <div className="space-y-2">
                  {getOptions(q, "hi").map((opt, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <label key={idx} className={`block p-2 rounded cursor-pointer border ${isSelected ? "bg-blue-500 text-white border-blue-600" : "hover:bg-gray-50"}`}>
                        <input type="radio" checked={isSelected} onChange={() => selectAnswer(current, idx)} className="mr-2" />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-60" disabled={saving}>
              {saving ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </section>

        <aside className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-3">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => {
              const ans = answers[i] !== null && answers[i] !== undefined;
              const isCurrent = i === current;
              return (
                <button key={i} onClick={() => setCurrent(i)} className={`w-8 h-8 rounded-full text-sm font-semibold ${isCurrent ? "bg-blue-500 text-white" : ans ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}>{i + 1}</button>
              );
            })}
          </div>
        </aside>
      </main>
    </div>
  );
}