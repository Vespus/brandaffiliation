interface AffinitySliderProps {
  value: number; // 0 = nur Skalen, 1 = nur Text
  onChange: (value: number) => void;
}

export default function AffinitySlider({ value, onChange }: AffinitySliderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Affinitätsgewichtung
      </label>
      
      <div className="flex items-center space-x-4">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <span className="text-sm font-medium text-gray-900 min-w-[7rem] text-right">
          {value === 0 
            ? 'Nur Skalen' 
            : value === 1 
              ? 'Nur Text' 
              : `${Math.round((1 - value) * 100)}% / ${Math.round(value * 100)}%`
          }
        </span>
      </div>

      <p className="mt-1 text-sm text-gray-500">
        Gewichtung zwischen Skalen- und Text-basierter Affinität
      </p>
    </div>
  );
} 