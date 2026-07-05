import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        className={`rounded-[0.5rem] border border-outline-variant bg-surface px-3 py-2 text-base text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none ${className}`}
        {...props}
      />
    );

    if (!label) {
      return (
        <div className="flex flex-col gap-1">
          {input}
          {error && <span className="text-sm text-error">{error}</span>}
        </div>
      );
    }

    return (
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-on-surface tracking-wide">
          {label}
        </span>
        {input}
        {error && <span className="text-sm text-error">{error}</span>}
      </label>
    );
  }
);
Input.displayName = "Input";
