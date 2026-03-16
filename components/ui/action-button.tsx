"use client";

import Link from "next/link";

export default function ActionButton({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center",
        "rounded-2xl",
        "border",
        "px-5 py-3",
        "text-sm font-semibold",
        "transition-all",
        primary
          ? "border-[#d4af37] bg-[#d4af37] text-black hover:brightness-110"
          : "border-[#d4af37]/25 bg-black/30 text-white hover:border-[#d4af37]/40 hover:bg-[#d4af37]/8",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}