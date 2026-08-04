"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@powerspark/ui";
import { verifyEmailRequest } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";

type Status = "pending" | "verifying" | "success" | "error" | "missing-token";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>(token ? "verifying" : "missing-token");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("missing-token");
      return;
    }

    let cancelled = false;

    verifyEmailRequest({ token })
      .then(() => {
        if (!cancelled) setStatus("success");
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorMessage(error instanceof ApiError ? error.message : "Something went wrong.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email verification</CardTitle>
        <CardDescription>Confirming your PowerSpark Panel email address.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <p className="text-sm text-muted-foreground">Your email has been verified.</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{errorMessage}</p>
          </>
        )}
        {status === "missing-token" && (
          <>
            <XCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              This link is missing its verification token.
            </p>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to log in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
