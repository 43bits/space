'use client';

import { useGLTF, useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SHIP_LIMIT_Y = -2;
const SCREEN_LIMIT_X = 5;

export default function SpaceShooterPage() {
  const [score, setScore] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(true);
  const [zoom, setZoom] = useState(100); // ✅ Add zoom for camera

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setZoom(window.innerWidth < 768 ? 60 : 100);
    }
  }, []);

  function handleGameOver() {
    setRunning(false);
    setGameOver(true);
  }

  function restartGame() {
    setScore(0);
    setResetTrigger((prev) => prev + 1);
    setRunning(true);
    setGameOver(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.scorePanel}>
        <span>🚀 Score: <strong>{score}</strong></span>
      </div>

      <Canvas
        orthographic
        camera={{ zoom, position: [0, 0, 100] }}
        style={{ touchAction: 'none' }}
      >
        <ambientLight />
        <Stars />
        <Ship reset={resetTrigger} running={running} />
        <Asteroids onHit={handleGameOver} reset={resetTrigger} running={running} />
        <Points onCollect={() => setScore((s) => s + 1)} reset={resetTrigger} running={running} />
      </Canvas>

      {gameOver && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h2>💥 Game Over</h2>
            <p>Your Score: {score}</p>
            <button onClick={restartGame} style={styles.restartBtn}>Restart</button>
          </div>
        </div>
      )}
    </div>
  );
}





function Stars() {
  const groupRef = useRef<THREE.Group>(null);
  const starCount = 300;
  const stars = useRef<THREE.Vector3[]>([]);

 
  useEffect(() => {
    stars.current = Array.from({ length: starCount }).map(() =>
      new THREE.Vector3(
        Math.random() * 10 - 5,
        Math.random() * 12 - 6, 
        -Math.random() * 5 
      )
    );
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    stars.current.forEach((star) => {
      star.y -= 0.02;
      if (star.y < -6) {
        star.y = 6;
        star.x = Math.random() * 10 - 5;
      }
    });

   
    groupRef.current.children.forEach((mesh, i) => {
      mesh.position.copy(stars.current[i]);
    });
  });

  return (
    <group ref={groupRef}>
      {stars.current.map((pos, i) => (
        <mesh key={i} position={pos}>
          <circleGeometry args={[0.01]} />
          <meshBasicMaterial color="white" />
        </mesh>
      ))}
    </group>
  );
}
function Ship({ reset, running }: { reset: number; running: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const velocity = useRef({ x: 0, y: 0 });
  const isTouching = useRef(false);
  const touchX = useRef(0);

  const { scene } = useGLTF('/models/rocket.gltf');

  // Desktop keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent, down: boolean) => {
      const speed = down ? 0.1 : 0;
      if (e.key === 'ArrowLeft' || e.key === 'a') velocity.current.x = -speed;
      if (e.key === 'ArrowRight' || e.key === 'd') velocity.current.x = speed;
      if (e.key === 'ArrowUp' || e.key === 'w') velocity.current.y = speed / 2;
      if (e.key === 'ArrowDown' || e.key === 's') velocity.current.y = -speed / 2;
    };

    const down = (e: KeyboardEvent) => handleKey(e, true);
    const up = (e: KeyboardEvent) => handleKey(e, false);

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // Touch input for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      isTouching.current = true;
      touchX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - touchX.current;
      velocity.current.x = dx * 0.0005;
    };

    const handleTouchEnd = () => {
      isTouching.current = false;
      velocity.current.x = 0;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.position.set(0, SHIP_LIMIT_Y, 0);
  }, [reset]);

  useFrame(() => {
    if (!ref.current || !running) return;

    ref.current.position.x += velocity.current.x;
    ref.current.position.y += velocity.current.y;

    if (ref.current.position.x > SCREEN_LIMIT_X)
      ref.current.position.x = SCREEN_LIMIT_X;
    if (ref.current.position.x < -SCREEN_LIMIT_X)
      ref.current.position.x = -SCREEN_LIMIT_X;
    if (ref.current.position.y > 0)
      ref.current.position.y = 0;
    if (ref.current.position.y < SHIP_LIMIT_Y)
      ref.current.position.y = SHIP_LIMIT_Y;

    (window as any).playerPosition = ref.current.position;
  });

  return (
    <group ref={ref} scale={0.5}>
      <primitive object={scene} />
    </group>
  );
}

function Asteroids({
  onHit,
  reset,
  running,
}: {
  onHit: () => void;
  reset: number;
  running: boolean;
}) {
  const refs = useRef<THREE.Group[]>([]);
  const { scene: asteroidScene } = useGLTF('/asteroid/scene.gltf');

  useEffect(() => {
    refs.current.forEach((ref) => {
      if (!ref) return;
      ref.position.set(
        Math.random() * SCREEN_LIMIT_X * 2 - SCREEN_LIMIT_X,
        Math.random() * 5 + 5,
        0
      );
    });
  }, [reset]);

  useFrame(() => {
    if (!running) return;

    refs.current.forEach((ref) => {
      if (!ref) return;

      ref.position.y -= 0.05;
      ref.rotation.x += 0.01;
      ref.rotation.y += 0.01;

      const player = (window as any).playerPosition as THREE.Vector3;
      if (ref.position.distanceTo(player) < 0.5) {
        onHit();
      }

      if (ref.position.y < -6) {
        ref.position.set(
          Math.random() * SCREEN_LIMIT_X * 2 - SCREEN_LIMIT_X,
          Math.random() * 3 + 5,
          0
        );
      }
    });
  });

  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <group
          key={i}
          ref={(el) => (refs.current[i] = el!)}
          scale={0.0244}
        >
          <primitive object={asteroidScene.clone()} />
        </group>
      ))}
    </>
  );
}

function Points({ onCollect, reset, running }: { onCollect: () => void; reset: number; running: boolean }) {
  const refs = useRef<THREE.Group[]>([]);
  const { scene: coinScene, materials } = useGLTF('/coin/scene.gltf');
  const textures = useTexture({
    map: '/coin/textures/Coin_baseColor.png',
    normalMap: '/coin/textures/Coin_normal.png',
    roughnessMap: '/coin/textures/Coin_metallicRoughness.png',
    metalnessMap: '/coin/textures/Coin_metallicRoughness.png',
    emissiveMap: '/coin/textures/Coin_baseColor.png', // optional for glow
  });
  useEffect(() => {
    coinScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          map: textures.map,
          normalMap: textures.normalMap,
          roughnessMap: textures.roughnessMap,
          metalnessMap: textures.metalnessMap,
          emissiveMap: textures.emissiveMap,
          emissive: new THREE.Color('deepskyblue'),
          emissiveIntensity: 2,
        });
      }
    });
  }, [coinScene, textures]);

  useEffect(() => {
    refs.current.forEach((ref) => {
      if (!ref) return;
      ref.position.set(
        Math.random() * SCREEN_LIMIT_X * 2 - SCREEN_LIMIT_X,
        Math.random() * 5 + 5,
        0
      );
    });
  }, [reset]);

  useFrame(() => {
    if (!running) return;

    refs.current.forEach((ref) => {
      if (!ref) return;
      ref.position.y -= 0.05;
      ref.rotation.y += 0.05;

      const player = (window as any).playerPosition as THREE.Vector3;
      if (ref.position.distanceTo(player) < 0.5) {
        onCollect();
        ref.position.set(
          Math.random() * SCREEN_LIMIT_X * 2 - SCREEN_LIMIT_X,
          Math.random() * 3 + 5,
          0
        );
      }

      if (ref.position.y < -6) {
        ref.position.set(
          Math.random() * SCREEN_LIMIT_X * 2 - SCREEN_LIMIT_X,
          Math.random() * 3 + 5,
          0
        );
      }
    });
  });

  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <group
          key={i}
          ref={(el) => (refs.current[i] = el!)}
          scale={0.5}
        >
          <primitive object={coinScene.clone()} />
        </group>
      ))}
    </>
  );
}




// 🎨 Styled UI
const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: 'black',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  scorePanel: {
  position: 'absolute' as const,
  top: '0px', // ⬅️ No gap above
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
  border: '2px solid cyan',
  borderRadius: '50px',
  padding: '12px 30px',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: 'white',
  zIndex: 10,
  boxShadow: '0 0 20px cyan',
  fontFamily: 'monospace',
},


  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '20px',
    boxSizing: 'border-box' as const,
  },
  modalBox: {
    backgroundColor: '#111',
    padding: '20px',
    borderRadius: '20px',
    border: '2px solid cyan',
    color: 'white',
    textAlign: 'center' as const,
    boxShadow: '0 0 30px cyan',
    width: '100%',
    maxWidth: '320px',
  },
  restartBtn: {
    marginTop: '15px',
    padding: '12px 24px',
    fontSize: '1rem',
    borderRadius: '30px',
    border: 'none',
    backgroundColor: 'cyan',
    color: '#000',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
};

useGLTF.preload('/models/rocket.gltf');
useGLTF.preload('/coin/scene.gltf');
useGLTF.preload('/asteroid/scene.gltf');

