'use client';

import { useRef, useEffect, useState, memo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import clsx from 'clsx';

const PLANET_IDS = [
  'mercure', 'venus', 'earth', 'mars',
  'jupiter', 'saturne', 'uranus', 'neptune', 'pluto',
];

function PlanetMesh({ texturePath }: { texturePath: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, texturePath);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} emissive={'#222'} emissiveIntensity={0.4} />
    </mesh>
  );
}

type PlanetSideProps = {
  id: string;
  setId: (id: string) => void;
  info: any;
  side: 'left' | 'right';
};

const PlanetSide = memo(function PlanetSide({ id, setId, info, side }: PlanetSideProps) {
  return (
    <div className={clsx(
      'flex flex-col items-center w-full md:w-1/2',
      side === 'left' ? 'animate-slideLeft' : 'animate-slideRight'
    )}>
      <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg border border-gray-600 bg-black">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.4} />
          <Stars radius={200} depth={60} count={5000} factor={7} fade />
          <OrbitControls enableZoom={false} enablePan={false} />
          <PlanetMesh texturePath={`/textures/${id}map.jpg`} />
        </Canvas>
        <div className="absolute top-2 right-2 z-10">
          <select
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="bg-black bg-opacity-60 border border-white p-1 rounded text-sm"
          >
            {PLANET_IDS.map(p => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {info && (
        <div className="bg-black bg-opacity-40 backdrop-blur mt-4 w-full max-w-sm rounded-lg p-4 border border-gray-700 shadow-lg hover:scale-[1.02] transition-all">
          <h2 className="text-xl font-bold mb-2">{info.englishName}</h2>
          <ul className="text-sm space-y-1 text-white/90">
            <li><strong>Mass:</strong> {info.mass?.massValue}×10^{info.mass?.massExponent} kg</li>
            <li><strong>Gravity:</strong> {info.gravity} m/s²</li>
            <li><strong>Density:</strong> {info.density} g/cm³</li>
            <li><strong>Radius:</strong> {info.meanRadius} km</li>
            <li><strong>Orbit Period:</strong> {info.sideralOrbit} days</li>
            <li><strong>Rotation:</strong> {info.sideralRotation} h</li>
            <li><strong>Temp:</strong> {info.avgTemp} K</li>
            <li><strong>Moons:</strong> {info.moons?.length || 0}</li>
          </ul>
        </div>
      )}
    </div>
  );
});

export default function PlanetComparePage() {
  const [leftId, setLeftId] = useState('earth');
  const [rightId, setRightId] = useState('mars');
  const [leftInfo, setLeftInfo] = useState<any>(null);
  const [rightInfo, setRightInfo] = useState<any>(null);

  useEffect(() => {
    const fetchPlanetInfo = async (id: string, set: (data: any) => void) => {
      try {
        const res = await fetch(`/api/planet-info?id=${id}`);
        const json = await res.json();
        set(json);
      } catch (err) {
        console.error('Failed to load planet data', err);
      }
    };

    fetchPlanetInfo(leftId, setLeftInfo);
    fetchPlanetInfo(rightId, setRightInfo);
  }, [leftId, rightId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0c1c] via-[#1c1b2a] to-[#141421] text-white p-4 sm:p-6">
      <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
        🪐 Planet Battle Arena
      </h1>

      <div className="flex flex-col md:flex-row justify-center items-start gap-10">
        <PlanetSide id={leftId} setId={setLeftId} info={leftInfo} side="left" />

        
        <div className="text-5xl font-bold text-center text-white/50 select-none">VS</div>

        <PlanetSide id={rightId} setId={setRightId} info={rightInfo} side="right" />
      </div>
    </div>
  );
}
