import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Optional empty/all placeholder option shown first */
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const baseCls =
  'border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white w-full';

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className = '',
  id,
}) => (
  <select
    id={id}
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
    className={`${baseCls} ${className}`.trim()}
  >
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

export default Select;
