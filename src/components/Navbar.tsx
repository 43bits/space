"use client";

import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "./ModeToggle";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Rocket, Menu, Orbit, SatelliteDish } from "lucide-react";
import { Button } from "./ui/button";

function Navbar() {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 container mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-xl sm:text-2xl mr-6 font-mono hover:opacity-80 transition-opacity"
        >
          <Rocket className="size-7 sm:size-8 text-indigo-500" />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-500 to-emerald-400 bg-clip-text text-transparent">
            SpaceVoyager
          </span>
        </Link>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Mobile menu button */}
        <button
          className="ml-2 sm:hidden"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Desktop menu */}
        <div className="hidden sm:flex items-center gap-4 ml-4">
          {isSignedIn ? (
            <>
              <Link href="/solar-system">
                <Button variant="ghost" className="gap-2">
                  <Orbit className="w-4 h-4" />
                  Planets
                </Button>
              </Link>
              
              <Link href="/profile">
                <Button variant="outline" className="gap-2">
                  Profile
                </Button>
              </Link>
            </>
          ) : (
            <>
              <SignInButton>
                <Button variant="outline">Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-primary text-white">Sign Up</Button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-background border-b shadow-md flex flex-col items-start gap-2 px-4 py-3 sm:hidden z-50">
            {isSignedIn ? (
              <>
                <Link href="/solar-system" className="w-full">
                  <Button className="w-full gap-2" variant="ghost">
                    <Orbit className="w-4 h-4" />
                    Planets
                  </Button>
                </Link>
                
                <Link href="/profile" className="w-full">
                  <Button className="w-full gap-2" variant="outline">
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <SignInButton>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="bg-primary text-white w-full">
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
