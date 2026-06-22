import { LoginForm } from "@/app/login/LoginForm";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground">Enter your id and password to continue.</p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
