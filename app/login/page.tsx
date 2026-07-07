import { LoginForm } from "@/app/login/LoginForm";

export default function Home() {
  return (
    <main className="bg-muted/30 flex min-h-screen items-center justify-center px-4 py-10">
      <section className="bg-card text-card-foreground w-full max-w-sm rounded-lg border p-6 shadow-sm">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email and password to continue.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
