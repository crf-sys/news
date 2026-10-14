import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// /admin exige sesión. Qué emails pueden entrar se comprueba en requireAdmin() (src/lib/admin.ts).
const isAdmin = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdmin(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
