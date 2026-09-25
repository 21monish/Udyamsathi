'use client';

import { State } from 'country-state-city';

type IndiaStateSelectProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  className?: string;
};

const indianStates = State.getStatesOfCountry('IN').sort((a, b) => a.name.localeCompare(b.name));

export default function IndiaStateSelect({ value, onChange, id = 'state', required = false, className = '' }: IndiaStateSelectProps) {
  return (
    <select
      id={id}
      aria-label="State or Union Territory"
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      className={`mt-1 w-full rounded-lg border p-3 ${className}`}
    >
      <option value="">Select State or Union Territory</option>
      {indianStates.map((state) => (
        <option key={state.isoCode} value={state.name}>
          {state.name}
        </option>
      ))}
    </select>
  );
}
