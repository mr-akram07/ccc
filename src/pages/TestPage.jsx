import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/*
  TestPage.jsx
  - Shows English (left) and Hindi (right) simultaneously
  - Answers stored as selected option index (0..n-1)
  - Works with bilingual questions (preferred) or falls back to single-language
  - Autosave to localStorage
  - Submit posts to /api/student/submit (expects auth token in ccc_user)
*/

export default function TestPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]); // array of question objects
  const [answers, setAnswers] = useState([]); // array of selected index or null
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 30); // default 30 min
  const [submitted, setSubmitted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [saving, setSaving] = useState(false);

  const STORAGE_KEY = "ccc_test_data_v2";

  // load saved progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.answers) {
          setAnswers(parsed.answers);
          setCurrent(parsed.current || 0);
          setTimeLeft(parsed.timeLeft ?? 60 * 30);
          setSubmitted(parsed.submitted || false);
        }
      }
    } catch (err) {
      console.error("load saved:", err);
    }
  }, []);

  // fetch questions (student public endpoint)
  useEffect(() => {
    let mounted = true;
    const fetchQs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/student/questions`);
        if (!res.ok) {
          console.error("Failed to load questions", res.status);
          setLoadingQuestions(false);
          return;
        }
        const data = await res.json();

        // normalize questions: ensure correctAnswerIndex exists
        const normalized = data.map((q) => {
          const nq = { ...q };

          // preferred: correctAnswerIndex
          if (typeof nq.correctAnswerIndex === "number") {
            // already present
          } else if (nq.correctAnswer) {
            // try to find index by matching text in options
            const idx = Array.isArray(nq.options) ? nq.options.findIndex((o) => String(o).trim() === String(nq.correctAnswer).trim()) : -1;
            nq.correctAnswerIndex = idx >= 0 ? idx : null;
          } else {
            nq.correctAnswerIndex = null;
          }

          // if Hindi options missing, keep undefined (UI will fallback to English)
          return nq;
        });

        if (!mounted) return;
        setQuestions(normalized);
        setAnswers((prev) => {
          // ensure answers array length matches questions
          const arr = Array(normalized.length).fill(null);
          for (let i = 0; i < Math.min(prev.length, normalized.length); i++) arr[i] = prev[i];
          return arr;
        });
        setLoadingQuestions(false);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setLoadingQuestions(false);
      }
    };

    fetchQs();
    return () => (mounted = false);
  }, []);

  // autosave progress to localStorage every few seconds and on changes
  useEffect(() => {
    const save = () => {
      try {
        const payload = {
          answers,
          current,
          timeLeft,
          submitted,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.error("autosave error", err);
      }
    };

    save();
    const id = setInterval(save, 5000);
    return () => clearInterval(id);
  }, [answers, current, timeLeft, submitted]);

  // timer
  useEffect(() => {
    if (submitted) return;
    if (loadingQuestions) return;

    if (timeLeft <= 0) {
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
    try {
      const student = JSON.parse(localStorage.getItem("ccc_student"));
      const answersPayload = { answers };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/student/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${student.token}`,
          },
          body: JSON.stringify(answersPayload),
        }
      );

      const text = await res.text();
      if (text.startsWith("<!DOCTYPE")) {
        throw new Error("Backend returned HTML — check VITE_API_BASE_URL");
      }

      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || "Submission failed");

      alert("✅ Test submitted successfully!");
      localStorage.removeItem("ccc_test_data");
      window.location.href = "/student/review"; // or wherever you show results
    } catch (err) {
      console.error("Submit error:", err);
      alert("❌ " + err.message);
    }
  };


  // UI guards
  if (loadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading questions...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No questions available.
      </div>
    );
  }

  if (submitted) {
    const total = questions.length;
    const score = JSON.parse(localStorage.getItem(STORAGE_KEY))?.score ?? 0;
    const percentage = JSON.parse(localStorage.getItem(STORAGE_KEY))?.percentage ?? "0.00";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center max-w-xl w-full">
          <h1 className="text-2xl font-bold mb-3 text-green-700">Test Submitted ✅</h1>
          <p className="mb-2">Total Questions: {total}</p>
          <p className="mb-2">Score: {score}</p>
          <p className="mb-2">Percentage: {percentage}%</p>
          <p className="text-sm text-gray-600">You cannot retake the test.</p>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const total = questions.length;

  // helper: get option list in english / hindi
  const getOptions = (qObj, lang = "en") => {
    if (lang === "hi") {
      if (Array.isArray(qObj.optionsHi) && qObj.optionsHi.length) return qObj.optionsHi;
      // fallback: mirror english options if hindi missing
      return Array.isArray(qObj.options) ? qObj.options : [];
    }
    return Array.isArray(qObj.options) ? qObj.options : [];
  };

  const getQuestionText = (qObj, lang = "en") => {
    if (lang === "hi") return qObj.questionTextHi || qObj.questionText || "";
    return qObj.questionText || "";
  };

  // selected index for this question
  const selectedIndex = answers[current] ?? null;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
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
          <button
            onClick={() => {
              localStorage.removeItem("ccc_user");
              navigate("/login");
            }}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Left: question area with bilingual columns */}
        <section className="bg-white rounded shadow p-4">
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-semibold">Question {current + 1} of {total}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setCurrent((c) => Math.max(0, c - 1)); }}
                disabled={current === 0}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                ← Previous
              </button>
              <button
                onClick={() => { setCurrent((c) => Math.min(total - 1, c + 1)); }}
                disabled={current === total - 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>

          {/* bilingual display: English left, Hindi right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* English */}
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">English</h3>
              <div className="border rounded p-3 min-h-40">
                <p className="mb-3 text-gray-700">{getQuestionText(q, "en") || <span className="text-gray-400">No English text</span>}</p>

                <div className="space-y-2">
                  {getOptions(q, "en").map((opt, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <label key={idx} className={`block p-2 rounded cursor-pointer border ${isSelected ? "bg-blue-500 text-white border-blue-600" : "hover:bg-gray-50"}`}>
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => selectAnswer(current, idx)}
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hindi */}
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-2">Hindi</h3>
              <div className="border rounded p-3 min-h-40">
                <p className="mb-3 text-gray-700">{getQuestionText(q, "hi") || <span className="text-gray-400">No Hindi text</span>}</p>

                <div className="space-y-2">
                  {getOptions(q, "hi").map((opt, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <label key={idx} className={`block p-2 rounded cursor-pointer border ${isSelected ? "bg-blue-500 text-white border-blue-600" : "hover:bg-gray-50"}`}>
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => selectAnswer(current, idx)}
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Submit center */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </section>

        {/* Right: question grid */}
        <aside className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-3">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => {
              const ans = answers[i] !== null && answers[i] !== undefined;
              const isCurrent = i === current;
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-8 h-8 rounded-full text-sm font-semibold ${isCurrent ? "bg-blue-500 text-white" : ans ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </aside>
      </main>
    </div>
  );
}
