"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Globe,
  Rocket,
  Telescope,
  SatelliteDish,
  Newspaper
} from "lucide-react";

import { ActionCard } from "@/components/ActionCard";

export default function Home() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 pt-10">
      <div className="rounded-lg bg-card p-6 border shadow-sm mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 bg-clip-text text-transparent">
          Welcome to Space Explorer, {user.firstName} 🚀
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Navigate the cosmos and explore planets in real time.
        </p>
      </div>

      {/* Make the grid scrollable if content overflows */}
      <div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto", paddingBottom: "2rem" }}
      >
        <ActionCard
          title="Solar System"
          description="Explore planets in an interactive 3D view"
          icon={Globe}
          href="/solar-system"
          gradientFrom="sky-500"
          gradientTo="blue-600"
        />

        <ActionCard
          title="Planet compare"
          description="Detailed info about all known planets"
          icon={Telescope}
          href="/planet-compare"
          gradientFrom="purple-500"
          gradientTo="violet-600"
        />

        <ActionCard
          title="Launch Simulation"
          description="Experience the retro space game"
          icon={Rocket}
          href="/launch-center"
          gradientFrom="orange-500"
          gradientTo="red-600"
        />

        <ActionCard
          title="Quiz Satellite"
          description="Track artificial satellites orbiting Earth"
          icon={SatelliteDish}
          href="/quiz"
          gradientFrom="emerald-500"
          gradientTo="green-600"
        />
         <ActionCard
          title="Astronomy News"
          description="Latest from NASA, ESA, and beyond"
          icon={Newspaper}
          href="/space-news"
          gradientFrom="blue-600"
          gradientTo="cyan-500"
        />
        <ActionCard
         title="Random Planet"
         description="Open a random planet profile"
         icon={Globe}
           href="/random-planet" 
          gradientFrom="pink-500"
            gradientTo="rose-600"
          />

       
      </div>
      
    </div>
  );
}