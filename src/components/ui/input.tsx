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
        className={`rounded-[0.5rem] border border-outline-variant bg-surface px-3 py-2 text-base text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all duration-200 ${className}`}
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
        <span className="text-label-md text-on-surface">{label}</span>
        {input}
        {error && <span className="text-sm text-error">{error}</span>}
      </label>
    );
  }
);
Input.displayName = "Input";
