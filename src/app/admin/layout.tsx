import { Suspense } from "react";
import { SignOutButton } from "@clerk/nextjs";
import { adminEmail } from "@/lib/admin";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<p className="label mx-auto max-w-6xl px-4 pt-10 text-muted">Comprobando acceso…</p>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  const email = await adminEmail();
  if (!email) {
    return (
      <main className="mx-auto max-w-xl px-4 pt-20">
        <h1 className="display text-5xl">Sin acceso</h1>
        <p className="mt-4 text-muted">Esta cuenta no tiene permisos de edición. Pide que añadan tu email a la lista de editores.</p>
        <SignOutButton><button className="label mt-8 rounded-full border border-line px-5 py-3">Cerrar sesión</button></SignOutButton>
      </main>
    );
  }
  return (
    <>
      <div className="mx-auto flex max-w-6xl justify-end gap-3 px-4 pt-4">
        <span className="label text-[10px] text-muted">{email}</span>
        <SignOutButton><button className="label text-[10px] text-muted underline">Salir</button></SignOutButton>
      </div>
      {children}
    </>
  );
}
