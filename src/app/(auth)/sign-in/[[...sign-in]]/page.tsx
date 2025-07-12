import { SignIn } from "@clerk/nextjs";
import React from "react";

function SignInPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-neutral-500">
      <SignIn />
    </main>
  );
}

export default SignInPage;
