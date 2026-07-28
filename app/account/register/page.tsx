"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { INPUT_CLASS, CARD_CLASS, Field, FormError, SubmitButton } from "@/components/account/ui";

export default function RegisterPage() {
  const router = useRouter();
  const { customer, loading, register } = useCustomerAuth();

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", password: "", confirm: "",
  });
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && customer) router.replace("/account");
  }, [loading, customer, router]);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    // Checked here as well as in the plugin, so the customer hears about it
    // before a round-trip rather than after.
    if (form.password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Those passwords do not match.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await register({
        email:      form.email.trim(),
        password:   form.password,
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        phone:      form.phone.trim(),
      });
      router.replace("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-dark px-4 pt-28 pb-16">
      <div className="max-w-md mx-auto">
        <h1 className="font-playfair font-bold text-3xl md:text-4xl text-white mb-2">
          Create Your Account
        </h1>
        <p className="text-white/40 font-inter text-sm mb-7">
          Save your delivery details once, and track every order you place with us.
        </p>

        <div className={CARD_CLASS}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormError message={error} />

            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name" required>
                <input
                  required
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                  placeholder="John"
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Last Name">
                <input
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                  placeholder="Kamau"
                  className={INPUT_CLASS}
                />
              </Field>
            </div>

            <Field label="Email" required>
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Phone" hint="We use this to confirm delivery.">
              <input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="e.g. 0712 345 678"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Password" required hint="At least 8 characters.">
              <input
                required
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="••••••••"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Confirm Password" required>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                placeholder="••••••••"
                className={INPUT_CLASS}
              />
            </Field>

            <SubmitButton busy={busy} busyLabel="Creating account…">
              Create Account
            </SubmitButton>
          </form>
        </div>

        <p className="text-white/40 font-inter text-sm text-center mt-6">
          Already have an account?{" "}
          <Link href="/account/login" className="text-brand-yellow hover:underline underline-offset-4 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
