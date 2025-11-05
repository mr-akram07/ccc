import { useState, useEffect } from "react";

export default function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60 * 30); // 30 min
  const [submitted, setSubmitted] = useState(false);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalQuestions = questions.length;

  // ✅ Load saved test data
  const loadSavedData = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("ccc_test_data"));
      if (saved && saved.answers && !saved.submitted) return saved;
    } catch (err) {
      console.error("Error loading saved data:", err);
    }
    return null;
  };

  const savedData = loadSavedData();

  // ✅ Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/student/questions`);
        const data = await res.json();
        setQuestions(data);
        setAnswers(Array(data.length).fill(null));
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (savedData && !submitted) setShowResumePopup(true);
  }, [submitted]);

  const handleResume = () => {
    setAnswers(savedData.answers);
    setCurrentQuestion(savedData.currentQuestion || 0);
    setTimeLeft(savedData.timeLeft || 60 * 30);
    setShowResumePopup(false);
  };

  const handleStartNew = () => {
    localStorage.removeItem("ccc_test_data");
    setAnswers(Array(totalQuestions).fill(null));
    setCurrentQuestion(0);
    setTimeLeft(60 * 30);
    setShowResumePopup(false);
  };

  // ✅ Timer & autosave
  useEffect(() => {
    if (showResumePopup || submitted || totalQuestions === 0) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        localStorage.setItem(
          "ccc_test_data",
          JSON.stringify({
            answers,
            currentQuestion,
            timeLeft: newTime,
            submitted,
          })
        );
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, answers, currentQuestion, showResumePopup, submitted, totalQuestions]);

  // ✅ Save progress in localStorage
  useEffect(() => {
    if (!showResumePopup && !submitted && totalQuestions > 0) {
      localStorage.setItem(
        "ccc_test_data",
        JSON.stringify({
          answers,
          currentQuestion,
          timeLeft,
          submitted,
        })
      );
    }
  }, [answers, currentQuestion, timeLeft, submitted, showResumePopup, totalQuestions]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleAnswerSelect = (opt) => {
    const updated = [...answers];
    updated[currentQuestion] = opt;
    setAnswers(updated);
  };

  // ✅ Submit test (save to backend)
  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    window.location.href = "/review";

    const userData = JSON.parse(localStorage.getItem("ccc_user"));
    const correctCount = questions.filter(
      (q, i) => q.correctAnswer === answers[i]
    ).length;

    const resultPayload = {
      name: userData.user.name,
      rollNumber: userData.user.rollNumber,
      answers,
      score: correctCount,
      totalQuestions,
      percentage: ((correctCount / totalQuestions) * 100).toFixed(2),
    };

    // Save in localStorage
    localStorage.setItem("ccc_test_data", JSON.stringify({ ...resultPayload, submitted: true }));

    // Send to DB
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/student/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify(resultPayload),
      });
    } catch (err) {
      console.error("Error saving result:", err);
    }
  };

  // ✅ Show results after submission
  if (submitted) {
    const correctCount = questions.filter(
      (q, i) => q.correctAnswer === answers[i]
    ).length;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
        <h1 className="text-3xl font-bold mb-6 text-green-600">
          Test Submitted ✅
        </h1>
        <p className="text-lg font-medium">Total Questions: {totalQuestions}</p>
        <p className="text-lg font-medium">Correct Answers: {correctCount}</p>
        <p className="text-lg font-medium mb-4">
          Score: {((correctCount / totalQuestions) * 100).toFixed(2)}%
        </p>
        <p className="text-gray-600 italic">
          You cannot retake the test once submitted.
        </p>
      </div>
    );
  }

  // ✅ Resume test popup
  if (showResumePopup) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/60 z-50 p-4 text-center">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-sm w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            Resume Previous Test?
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            You have an unfinished test. Would you like to continue where you left off?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleResume}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Resume Test
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("ccc_test_data");
                window.location.href = "/";
              }}
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel Test
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (totalQuestions === 0)
    return (
      <div className="flex h-screen justify-center items-center text-gray-500">
        Loading questions...
      </div>
    );

  // ✅ Main Test UI
  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4 flex flex-col">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 sm:p-4 rounded-lg shadow mb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-700">
            CCC Mock Test
          </h1>
          {(() => {
            const user = JSON.parse(localStorage.getItem("ccc_user"));
            if (user && user.user) {
              return (
                <p className="text-gray-600 text-sm mt-1">
                  Welcome, {user.user.name} ({user.user.rollNumber})
                </p>
              );
            }
          })()}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-md sm:text-lg font-semibold text-red-500">
            Time Left: {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("ccc_user");
              window.location.href = "/login";
            }}
            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row flex-1 gap-3 sm:gap-4">
        <section className="flex-1 bg-white rounded-lg shadow p-3 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">
            Question {currentQuestion + 1} of {totalQuestions}
          </h2>
          <p className="text-gray-700 mb-6 text-sm sm:text-base">
            {questions[currentQuestion].questionText}
          </p>

          <div className="space-y-2 sm:space-y-3">
            {questions[currentQuestion].options.map((opt, idx) => (
              <label
                key={idx}
                className={`block p-2 sm:p-3 border rounded-lg cursor-pointer transition ${answers[currentQuestion] === opt
                  ? "bg-blue-500 text-white border-blue-600"
                  : "hover:bg-gray-100"
                  }`}
              >
                <input
                  type="radio"
                  name={`q${currentQuestion}`}
                  value={opt}
                  checked={answers[currentQuestion] === opt}
                  onChange={() => handleAnswerSelect(opt)}
                  className="mr-2 accent-blue-600"
                />
                {opt}
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 gap-3 sm:gap-0">
            <button
              onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
              disabled={currentQuestion === 0}
              className="w-full sm:w-auto px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              ← Previous
            </button>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
            >
              Submit Test
            </button>

            <button
              onClick={() =>
                setCurrentQuestion((prev) =>
                  Math.min(prev + 1, totalQuestions - 1)
                )
              }
              disabled={currentQuestion === totalQuestions - 1}
              className="w-full sm:w-auto px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </section>

        {/* Question Grid */}
        <aside className="md:w-1/4 bg-white rounded-lg shadow p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-center mb-2 sm:mb-3">
            Questions
          </h3>
          <div className="grid grid-cols-10 sm:grid-cols-5 md:grid-cols-5 gap-2 overflow-x-auto p-1">
            {answers.map((ans, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold transition ${index === currentQuestion
                  ? "bg-blue-500 text-white"
                  : ans
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </aside>
      </main>

      {/* Confirm Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Submit Test?b
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit the test? You cannot retake it once submitted.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  handleSubmit();
                  setShowConfirmModal(false);
                }}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Yes, Submit
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
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
