"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

function VerifyEmailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass-card rounded-lg shadow-navy p-8 text-center space-y-5 max-w-md w-full">
        {status === "loading" && (
          <>
            <LoadingSpinner size="lg" />
            <p className="text-on-surface-variant">Memverifikasi email kamu...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-14 h-14 text-tertiary-fixed-dim mx-auto" />
            <h1 className="text-headline-md text-primary">Email terverifikasi! ✦</h1>
            <p className="text-on-surface-variant">
              Akunmu sudah aktif sepenuhnya. Selamat menemukan jalurmu.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-secondary hover:bg-secondary-container text-on-secondary rounded-md px-6 py-3 text-button font-semibold transition"
            >
              Ke Dashboard
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-14 h-14 text-error mx-auto" />
            <h1 className="text-headline-md text-primary">Verifikasi gagal</h1>
            <p className="text-on-surface-variant">
              Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru dari halaman Settings.
            </p>
            <button
              onClick={() => router.push("/settings")}
              className="bg-secondary hover:bg-secondary-container text-on-secondary rounded-md px-6 py-3 text-button font-semibold transition"
            >
              Ke Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
