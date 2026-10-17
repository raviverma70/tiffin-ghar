"use client";

import type { ReactNode } from "react";

// message de do to click par pehle "pakka?" poochta hai
export default function ConfirmButton({
  message,
  className,
  children,
}: {
  message?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (message && !window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}