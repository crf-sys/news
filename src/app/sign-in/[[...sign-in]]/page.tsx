import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4 py-16">
      <Suspense>
        <SignIn appearance={{ variables: { colorPrimary: "#0b0b0c" } }} />
      </Suspense>
    </main>
  );
}
