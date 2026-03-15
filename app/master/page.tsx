"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MasterRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}