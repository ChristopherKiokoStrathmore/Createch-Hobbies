"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { INPUT_CLASS, CARD_CLASS, Field, FormError, FormNotice, SubmitButton } from "@/components/account/ui";

function LoginForm() {
  const router   = useRouter();
  const params   = useSearchParams();
  const { customer, loading, signIn } = useCustomerAuth();

  // Where to land after signing in. Only same-site paths are honoured, so a
  // crafted ?next=https://evil.example link cannot bounce a customer off-site.
  const rawNext  = params.get("next") ?? "/account";
  const next     = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");

  const [forgotMode, setForgotMode] = useState(false);
  const [notice, setNotice]         = useState("");

  useEffect(() => {
    if (!loading && customer) router.replace(next);
  }, [loading, customer, next, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await signIn(email.trim(), password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you in.");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await fetch("/api/account/forgot", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      // Same message whether or not the account exists.
      setNotice("If that email has an account, a reset link is on its way. Check your inbox and spam folder.");
      setForgotMode(false);
    } catch {
      setError("Could not send the reset link. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-dark px-4 pt-28 pb-16">
      <div className="max-w-md mx-auto">
        <h1 className="font-playfair font-bold text-3xl md:text-4xl text-white mb-2">
          {forgotMode ? "Reset Your Password" : "Welcome Back"}
        </h1>
        <p className="text-white/40 font-inter text-sm mb-7">
          {forgotMode
            ? "Enter your email and we will send you a reset link."
            : "Sign in to see your orders and saved delivery addresses."}
        </p>

        <div className={CARD_CLASS}>
          <form onSubmit={forgotMode ? handleForgot : handleSignIn} className="space-y-4">
            <FormNotice message={notice} />
            <FormError message={error} />

            <Field label="Email" required>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={INPUT_CLASS}
              />
            </Field>

            {!forgotMode && (
              <Field label="Password" required>
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={INPUT_CLASS}
                />
              </Field>
            )}

            <SubmitButton busy={busy} busyLabel={forgotMode ? "Sending…" : "Signing in…"}>
              {forgotMode ? "Send Reset Link" : "Sign In"}
            </SubmitButton>

            <button
              type="button"
              onClick={() => { setForgotMode(!forgotMode); setError(""); setNotice(""); }}
              className="w-full text-center text-white/40 hover:text-white font-inter text-xs underline underline-offset-4 transition-colors"
            >
              {forgotMode ? "Back to sign in" : "Forgot your password?"}
            </button>
          </form>
        </div>

        <p className="text-white/40 font-inter text-sm text-center mt-6">
          New here?{" "}
          <Link href="/account/register" className="text-brand-yellow hover:underline underline-offset-4 font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary to keep this route prerenderable.
  return (
    <Suspense fallback={<main className="min-h-screen bg-brand-dark" />}>
      <LoginForm />
    </Suspense>
  );
}
