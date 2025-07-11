// app/random-planet/page.tsx
import { GoogleGenerativeAI } from '@google/generative-ai';
import Image from 'next/image';

// Planets List
const planets = [
  'Mercury', 'Venus', 'Earth', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
];

// Helper to get a random planet
function getRandomPlanet() {
  return planets[Math.floor(Math.random() * planets.length)];
}

// Fetch 3 fun facts from Gemini
async function getPlanetFacts(planet: string): Promise<string[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{
        text: `Give me 3 interesting and real facts about the planet ${planet}. Keep it simple and fun. Return only the facts in a numbered list.`,
      }],
    }],
  });

  const text = await result.response.text();

  return text
    .split('\n')
    .filter(line => /^\d+\./.test(line))
    .map(line => line.replace(/^\d+\.\s*/, ''));
}

// Fetch 1 quiz question with 4 options, mark correct with *
async function getPlanetQuiz(planet: string): Promise<{
  question: string;
  options: string[];
  answer: string;
}> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{
        text: `Create a multiple choice quiz question about ${planet} with 4 options. Mark the correct one with an asterisk (*). Format: Question first, then options labeled A. B. C. D.`,
      }],
    }],
  });

  const text = await result.response.text();
  const lines = text.trim().split('\n');

  const question = lines[0];
  const optionsRaw = lines.slice(1).filter(line => /^[A-Da-d]\./.test(line));

  const options = optionsRaw.map(opt =>
    opt.replace(/^[A-Da-d]\.\s*/, '').replace('*', '').trim()
  );

  const answerRaw = optionsRaw.find(opt => opt.includes('*')) || '';
  const correct = answerRaw.replace(/^[A-Da-d]\.\s*/, '').replace('*', '').trim();

  return {
    question,
    options,
    answer: correct,
  };
}

export default async function RandomPlanetPage() {
  const planet = getRandomPlanet();
  const facts = await getPlanetFacts(planet);
  const quiz = await getPlanetQuiz(planet);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-gray-950 text-white px-6 py-10 flex flex-col items-center">
      <h1 className="text-5xl font-extrabold text-center mb-8">
        🌌 Explore <span className="text-blue-500">{planet}</span>
      </h1>

      {/* Planet Image */}
      <div className="w-64 h-64 overflow-hidden mb-8 shadow-[0_0_60px_10px_rgba(59,130,246,0.5)] rounded-full">
        <Image
          src={`/planets/${planet.toLowerCase()}.jpg`}
          alt={`${planet} image`}
          width={256}
          height={256}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Gemini Facts */}
      <div className="bg-zinc-900/80 border border-zinc-700 rounded-xl shadow-xl max-w-2xl w-full p-6 backdrop-blur-md mb-10">
        <h2 className="text-2xl font-bold mb-4 text-emerald-400">
          🔭 Gemini Says About {planet}
        </h2>
        <ul className="list-decimal pl-6 space-y-4 text-lg text-slate-300">
          {facts.map((fact, i) => (
            <li key={i} className="hover:text-teal-300 transition duration-200">
              {fact}
            </li>
          ))}
        </ul>
      </div>

      {/* Quiz Section */}
      <div className="bg-zinc-900/80 border border-teal-700 rounded-xl shadow-xl max-w-2xl w-full p-6 backdrop-blur-md mb-4">
        <h2 className="text-xl font-bold mb-4 text-cyan-400">🧠 Quiz Time!</h2>
        <p className="text-lg text-white mb-6">{quiz.question}</p>
        <ul className="space-y-3 mb-4">
          {quiz.options.map((opt, i) => (
            <li
              key={i}
              className="bg-slate-800 hover:bg-slate-700 transition rounded px-4 py-2 cursor-pointer"
            >
              {opt}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-green-400">
          ✅ Correct Answer: <span className="font-semibold">{quiz.answer}</span>
        </p>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        🔄 Refresh the page to discover a new planet
      </div>
    </div>
  );
}
