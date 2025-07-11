'use client';

import dynamic from 'next/dynamic';

// Dynamically import the game and disable SSR
const SpaceShooterPage = dynamic(() => import('@/components/SpaceShooterPage'), {
  ssr: false,
  loading: () => <div className="text-white text-center py-20">🚀 Loading Space Shooter...</div>,
});

export default function LaunchCenterPage() {
  return <SpaceShooterPage />;
}
