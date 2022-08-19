import { Range } from 'react-range';

export interface RangeSliderProps {
  isDisabled: boolean;
  onChange: (values: number[]) => void;
  values: number[];
  max?: number;
}

export default function RangeSlider({ isDisabled, onChange, values, max }: RangeSliderProps) {
  return (
    <Range
      step={10}
      min={0}
      disabled={isDisabled}
      max={max}
      values={values}
      onChange={onChange}
      renderTrack={({ props, children }) => (
        <div
          {...props}
          style={{
            ...props.style,
            height: '6px',
            borderRadius: '12px',
            width: '100%',
            backgroundColor: '#f2ecec',
          }}
        >
          {children}
        </div>
      )}
      renderThumb={({ props }) => (
        <div
          {...props}
          className="bg-blue-700"
          style={{
            ...props.style,
            height: '20px',
            width: '20px',
            borderRadius: '100%',
          }}
        />
      )}
    />
  );
}
