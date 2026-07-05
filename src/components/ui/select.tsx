import React from "react";

type SelectOption = { value: string; label: string };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: SelectOption[];
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    const select = (
      <select
        ref={ref}
        className={`rounded-[0.5rem] border border-outline-variant bg-surface px-3 py-2 text-base text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none transition-all duration-200 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );

    if (!label) {
      return (
        <div className="flex flex-col gap-1">
          {select}
          {error && <span className="text-sm text-error">{error}</span>}
        </div>
      );
    }

    return (
      <label className="flex flex-col gap-1">
        <span className="text-label-md text-on-surface">{label}</span>
        {select}
        {error && <span className="text-sm text-error">{error}</span>}
      </label>
    );
  }
);
Select.displayName = "Select";
