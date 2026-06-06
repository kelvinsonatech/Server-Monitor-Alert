"use client";
import { useState, useEffect } from "react";

interface ClientDateProps {
  value: string | null | undefined;
  format?: "time" | "datetime";
  fallback?: string;
}

export function ClientDate({ value, format = "time", fallback = "Never" }: ClientDateProps) {
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (!value) { setDisplay(null); return; }
    const d = new Date(value);
    setDisplay(format === "time" ? d.toLocaleTimeString() : d.toLocaleString());
  }, [value, format]);

  if (display === null) return <>{!value ? fallback : "..."}</>;
  return <>{display}</>;
}
