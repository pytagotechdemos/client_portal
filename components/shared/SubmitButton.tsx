"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      className={`px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
    >
      {pending ? "Saving..." : children}
    </button>
  );
}
