'use client';

import { useEffect, useState } from 'react';

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

const TOTAL_QUESTIONS = 10;
const TIME_LIMIT = 40; // seconds

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quiz');
      const data = await res.json();
      setCurrentQuestion(data);
    } catch (err) {
      console.error('Failed to fetch question:', err);
    } finally {
      setLoading(false);
      setTimeLeft(TIME_LIMIT);
    }
  };

  useEffect(() => {
    if (!started || !currentQuestion || selected) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleAnswer(null);
          return TIME_LIMIT;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, currentQuestion, selected]);

  const handleAnswer = (option: string | null) => {
    if (!currentQuestion) return;

    const isCorrect = option === currentQuestion.correctAnswer;
    if (isCorrect) setScore(prev => prev + 5);
    setSelected(option);

    setTimeout(() => {
      if (questionNumber >= TOTAL_QUESTIONS) {
        alert(`🌟 Quiz Complete! You scored ${score + (isCorrect ? 5 : 0)} out of ${TOTAL_QUESTIONS * 5}`);
        setStarted(false);
        setScore(0);
        setQuestionNumber(1);
        setSelected(null);
        setCurrentQuestion(null);
        return;
      }

      setQuestionNumber(q => q + 1);
      setSelected(null);
      fetchQuestion();
    }, 1500);
  };

  const startQuiz = () => {
    setStarted(true);
    setScore(0);
    setQuestionNumber(1);
    setTimeLeft(TIME_LIMIT);
    fetchQuestion();
  };

  const progress = (timeLeft / TIME_LIMIT) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-gray-950 text-white flex items-center justify-center px-4">
      {!started ? (
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">🪐 Astronomy Quiz</h1>
          <p className="text-lg text-slate-300">Test your knowledge of the universe in 10 questions!</p>
          <button
            onClick={startQuiz}
            className="bg-indigo-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-700 transition"
          >
            Start Quiz
          </button>
        </div>
      ) : (
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-8 rounded-xl shadow-xl w-full max-w-xl space-y-6 relative">
          <div className="text-sm text-gray-300 flex justify-between">
            <span>Question {questionNumber}/{TOTAL_QUESTIONS}</span>
            <span>Score: {score}</span>
          </div>

          <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className={`h-full ${progress < 20 ? 'bg-red-500' : 'bg-green-500'} transition-all`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {loading || !currentQuestion ? (
            <p className="text-center text-slate-400">Loading question...</p>
          ) : (
            <>
              <h2 className="text-xl font-semibold">{currentQuestion.question}</h2>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {currentQuestion.options.map((opt, i) => {
                  const isCorrect = opt === currentQuestion.correctAnswer;
                  const isSelected = opt === selected;
                  const color =
                    selected === null
                      ? 'hover:bg-slate-800 bg-slate-900'
                      : isCorrect
                      ? 'bg-green-600'
                      : isSelected
                      ? 'bg-red-600'
                      : 'bg-slate-800';

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!selected}
                      className={`p-3 rounded text-sm font-medium transition-all border border-slate-700 ${color}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="text-right text-xs text-slate-400 mt-2">
                ⏳ Time left: {timeLeft}s
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
