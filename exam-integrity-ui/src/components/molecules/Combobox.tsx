import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  noOptionsText?: string;
}

const baseInputCls =
  'border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white w-full';

const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  onSelect,
  options,
  placeholder,
  className = '',
  disabled,
  noOptionsText = 'No tags found',
}) => {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = React.useMemo(() => {
    const keyword = value.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(keyword) || option.value.toLowerCase().includes(keyword),
    );
  }, [options, value]);

  const commitValue = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) return;
    onSelect(trimmed);
    onChange('');
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`.trim()}>
      <input
        value={value}
        disabled={disabled}
        className={baseInputCls}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          if (!open) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            const highlighted = filteredOptions[0]?.value ?? value;
            commitValue(highlighted);
          }
          if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      <ChevronDown
        size={16}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />

      {open && !disabled && (
        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">{noOptionsText}</div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-primary-50"
                onClick={() => commitValue(option.value)}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Combobox;