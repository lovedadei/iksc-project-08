
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PledgeFormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  required?: boolean;
  transform?: (value: string) => string;
}

const PledgeFormInput: React.FC<PledgeFormInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  transform
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = transform ? transform(e.target.value) : e.target.value;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-slate-700 font-medium text-sm">
        {label} {required && '*'}
      </Label>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`transition-all duration-300 border-2 focus:ring-2 focus:ring-emerald-500/20 ${
          error 
            ? 'border-red-400 focus:border-red-500' 
            : 'border-slate-200 focus:border-emerald-500 hover:border-slate-300'
        }`}
      />
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <span className="text-xs">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default PledgeFormInput;
