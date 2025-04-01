interface AffinitySliderProps {
  value: number; // 0 = nur Skalen, 1 = nur Text
  onChange: (value: number) => void;
}

export default function AffinitySlider({ value, onChange }: AffinitySliderProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Affinitätsgewichtung</h3>
        <div className="text-sm text-gray-600">
          {value === 0 ? 'Nur Skalen' : value === 1 ? 'Nur Text' : `${Math.round((1 - value) * 100)}% Skalen, ${Math.round(value * 100)}% Text`}
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="absolute top-0 left-0 w-full h-2 pointer-events-none">
          <div 
            className="h-full bg-blue-600 rounded-lg"
            style={{ width: `${value * 100}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>Nur Skalen</span>
        <span>Nur Text</span>
      </div>
    </div>
  );
} 