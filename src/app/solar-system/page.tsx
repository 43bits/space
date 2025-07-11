'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense, useRef } from 'react';


type PlanetProps = {
  name: string;
  size: number;
  distance: number;
  orbitSpeed: number;
  texturePath: string;
  message: string;
};

function Planet({
  name,
  size,
  distance,
  orbitSpeed,
  texturePath,
  message,
}: PlanetProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, texturePath);

  const speedMultiplier = 0.5; // 🐢 Slow down the orbit globally
  useFrame(({ clock }) => {
  const t = clock.getElapsedTime() * orbitSpeed * speedMultiplier;
  ref.current.position.x = Math.cos(t) * distance;
  ref.current.position.z = Math.sin(t) * distance;
});

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial map={texture} />

      {/* Floating popup label */}
      <Html
        position={[0, size + 0.7, 0]}
        center
        className="planet-label"
        style={{
          background: 'rgba(0, 0, 0, 0.65)',
          padding: '6px 10px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '12px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          backdropFilter: 'blur(4px)',
        }}
      >
        <strong>{name}</strong>
        <br />
        {message}
      </Html>
    </mesh>
  );
}

function SolarSystem() {
  const sunTexture = useLoader(THREE.TextureLoader, '/textures/sunmap.jpg');

  return (
    <group position={[0, 2, 0]}>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
      <pointLight position={[0, 0, 0]} intensity={10} distance={100} color="white" castShadow />

      {/* Stars */}
      <Stars radius={300} depth={60} count={7000} factor={7} fade />

      {/* Sun with texture */}
      <mesh>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial
          map={sunTexture}
          emissive={'#ffaa00'}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Planets (same as before) */}
      <Planet name="Mercury" size={0.3} distance={4} orbitSpeed={0.4} texturePath="/textures/mercuremap.jpg" message="Fastest orbit!" />
      <Planet name="Venus" size={0.5} distance={6} orbitSpeed={0.3} texturePath="/textures/venusmap.jpg" message="Hot and cloudy 🔥" />
      <Planet name="Earth" size={0.5} distance={8} orbitSpeed={0.25} texturePath="/textures/earthmap.jpg" message="Our home 🌍" />
      <Planet name="Mars" size={0.4} distance={10} orbitSpeed={0.2} texturePath="/textures/marsmap.jpg" message="The red planet 🔴" />
      <Planet name="Jupiter" size={1.2} distance={14} orbitSpeed={0.15} texturePath="/textures/jupitermap.jpg" message="The gas giant 👑" />
      <Planet name="Saturn" size={1.1} distance={18} orbitSpeed={0.12} texturePath="/textures/saturnmap.jpg" message="Rings of glory 💍" />
      <Planet name="Uranus" size={0.8} distance={22} orbitSpeed={0.1} texturePath="/textures/uranusmap.jpg" message="Sideways spinner 🌀" />
      <Planet name="Neptune" size={0.8} distance={26} orbitSpeed={0.08} texturePath="/textures/neptunemap.jpg" message="Dark and windy 💨" />
      <Planet name="Pluto" size={0.2} distance={30} orbitSpeed={0.06} texturePath="/textures/plutomap.jpg" message="Still loved 💖" />
    </group>
  );
}


export default function SolarSystemPage() {
  return (
    <div className="h-screen w-full bg-black">
      <Canvas shadows camera={{ position: [0, 10, 30], fov: 50 }}>
        <Suspense fallback={null}>
          <OrbitControls enableZoom enablePan />
          <SolarSystem />
        </Suspense>
      </Canvas>
    </div>
  );
}
