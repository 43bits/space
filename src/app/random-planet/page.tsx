'use client';

import { useEffect, useState } from 'react';

const planets = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];

function getRandomPlanet() {
  return planets[Math.floor(Math.random() * planets.length)];
}

export default function RandomPlanetPage() {
  const [planet, setPlanet] = useState(getRandomPlanet());
  const [facts, setFacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacts = async () => {
      try {
        const res = await fetch(`/api/gemini-facts?planet=${planet}`);
        const data = await res.json();
        setFacts(data.facts ?? []);
      } catch (err) {
        console.error('Failed to fetch facts', err);
        setFacts(['Unable to fetch facts at the moment.']);
      } finally {
        setLoading(false);
      }
    };

    fetchFacts();
  }, [planet]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-gray-900 text-white px-6 py-10">
      <h1 className="text-center text-4xl font-bold mb-6">
        Random Planet: <span className="text-blue-400">{planet}</span>
      </h1>

      {/* Future: You can embed a rotating 3D planet here using Drei + Fiber */}

      <div className="max-w-2xl mx-auto bg-zinc-800 rounded-lg shadow-lg p-6 mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-400">
          Fun Facts from Gemini ✨
        </h2>
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading facts...</p>
        ) : (
          <ul className="list-disc space-y-3 pl-5 text-base">
            {facts.map((fact, i) => (
              <li
                key={i}
                className="hover:scale-[1.02] hover:text-teal-300 transition-all duration-300"
              >
                {fact}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => {
            setPlanet(getRandomPlanet());
            setFacts([]);
            setLoading(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded transition"
        >
          🔄 Explore Another Planet
        </button>
      </div>
    </div>
  );
}
