'use client';

import { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

// Local fallback questions
const LOCAL_QUESTIONS: QuizQuestion[] = [
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: "Mars",
  },
  {
    question: "Which planet has the most moons?",
    options: ["Earth", "Mars", "Saturn", "Neptune"],
    correctAnswer: "Saturn",
  },
  {
    question: "What is the closest planet to the Sun?",
    options: ["Venus", "Mercury", "Mars", "Jupiter"],
    correctAnswer: "Mercury",
  },
  {
    question: "Which planet is famous for its rings?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctAnswer: "Saturn",
  },
  {
    question: "Which is the largest planet in our solar system?",
    options: ["Earth", "Jupiter", "Saturn", "Neptune"],
    correctAnswer: "Jupiter",
  },
  {
    question: "What is the hottest planet in the solar system?",
    options: ["Mercury", "Venus", "Mars", "Earth"],
    correctAnswer: "Venus",
  },
  {
    question: "Which planet spins on its side?",
    options: ["Mars", "Jupiter", "Uranus", "Earth"],
    correctAnswer: "Uranus",
  },
  {
    question: "What galaxy do we live in?",
    options: ["Andromeda", "Milky Way", "Whirlpool", "Sombrero"],
    correctAnswer: "Milky Way",
  },
  {
    question: "Which planet is known for its Great Red Spot?",
    options: ["Jupiter", "Neptune", "Earth", "Mars"],
    correctAnswer: "Jupiter",
  },
  {
    question: "Which planet is farthest from the Sun?",
    options: ["Neptune", "Uranus", "Pluto", "Saturn"],
    correctAnswer: "Neptune",
  },
];

const TOTAL_QUESTIONS = 10;
const TIME_LIMIT = 40;

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [usedIndexes, setUsedIndexes] = useState<number[]>([]);

  const fetchGeminiQuestion = async (): Promise<QuizQuestion | null> => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
Create one fun and factual multiple-choice quiz question about astronomy. Format it exactly like:
Question: What planet is known as the Red Planet?
A. Earth
B. Mars*
C. Jupiter
D. Venus
      `;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();

      const lines = text.trim().split('\n').filter(Boolean);
      const questionLine = lines.find(l => l.toLowerCase().startsWith('question:'));
      const optionLines = lines.filter(l => /^[A-Da-d][.)]/.test(l));

      if (!questionLine || optionLines.length !== 4) throw new Error("Invalid Gemini format");

      const question = questionLine.replace(/^Question:\s*/i, '').trim();

      const options = optionLines.map(opt =>
        opt.replace(/^[A-Da-d][.)]\s*/, '').replace('*', '').trim()
      );

      const correctRaw = optionLines.find(opt => opt.includes('*'));
      if (!correctRaw) throw new Error("No correct option marked");

      const correctAnswer = correctRaw.replace(/^[A-Da-d][.)]\s*/, '').replace('*', '').trim();

      return { question, options, correctAnswer };
    } catch (err) {
      console.error("⚠️ Gemini error, using fallback:", err);
      return null;
    }
  };

  const loadQuestion = async () => {
    let question = await fetchGeminiQuestion();

    if (!question) {
      const unused = LOCAL_QUESTIONS.filter((_, i) => !usedIndexes.includes(i));
      const random = unused[Math.floor(Math.random() * unused.length)];
      const index = LOCAL_QUESTIONS.indexOf(random);
      setUsedIndexes(prev => [...prev, index]);
      question = random;
    }

    setCurrentQuestion(question);
    setTimeLeft(TIME_LIMIT);
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
        alert(`🌟 Quiz Complete! You scored ${score + (isCorrect ? 5 : 0)} / ${TOTAL_QUESTIONS * 5}`);
        resetQuiz();
        return;
      }

      setQuestionNumber(q => q + 1);
      setSelected(null);
      loadQuestion();
    }, 1500);
  };

  const resetQuiz = () => {
    setStarted(false);
    setScore(0);
    setQuestionNumber(1);
    setSelected(null);
    setCurrentQuestion(null);
    setUsedIndexes([]);
  };

  const startQuiz = () => {
    resetQuiz();
    setStarted(true);
    loadQuestion();
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

          {!currentQuestion ? (
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
