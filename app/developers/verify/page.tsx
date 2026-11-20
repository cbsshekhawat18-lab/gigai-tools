"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Container } from "@/components/shared/container";
import { api } from "@/lib/devapi/client";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = React.useState<"working" | "done" | "failed">("working");

  React.useEffect(() => {
    if (!token) {
      setState("failed");
      return;
    }
    void api(`/auth/verify?token=${encodeURIComponent(token)}`, {}, false).then((r) =>
      setState(r.ok ? "done" : "failed"),
    );
  }, [token]);

  return (
    <section className="py-16">
      <Container size="narrow">
        <h1 className="text-2xl font-bold text-foreground">Email verification</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {state === "working" && "Checking your verification link…"}
          {state === "done" && "Your email is verified. You can log in now."}
          {state === "failed" &&
            "This link is invalid or expired. Log in to request a new one, or sign up again."}
        </p>
        <p className="mt-4 text-sm">
          <Link href="/developers" className="font-semibold text-primary hover:underline">
            Back to the developer page
          </Link>
        </p>
      </Container>
    </section>
  );
}

export default function VerifyPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyInner />
    </React.Suspense>
  );
}
