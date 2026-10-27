"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuggestIndustryPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/ecosystem/join?path=suggest");
  }, [router]);
  return null;
}
