export interface DatePickerProps {
  onChange: (dateISO: string) => void;
  value: string;
  label: string;
  name: string;
}

export default function DatePicker({ onChange, value, label, name }: DatePickerProps) {
  return (
    <div className="text-center">
      <label htmlFor={name} className="block">
        {label}
      </label>
      <input
        type="date"
        id={name}
        name={name}
        onChange={(evt) => onChange(new Date(evt.target.value).toISOString())}
        value={value}
      />
    </div>
  );
}
