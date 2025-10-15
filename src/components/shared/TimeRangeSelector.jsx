import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useTimeRange, TIME_RANGE_PRESETS } from '../../contexts/TimeRangeContext';

/**
 * TimeRangeSelector component for filtering data by time range
 */
export function TimeRangeSelector() {
  const {
    selectedPreset,
    setPreset,
    setCustomRange,
    getFormattedRange,
    customStartDate,
    customEndDate
  } = useTimeRange();

  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  // Preset button configurations
  const presets = [
    { id: TIME_RANGE_PRESETS.LAST_30_DAYS, label: 'Last 30 Days' },
    { id: TIME_RANGE_PRESETS.LAST_90_DAYS, label: 'Last 90 Days' },
    { id: TIME_RANGE_PRESETS.YEAR_TO_DATE, label: 'Year to Date' },
    { id: TIME_RANGE_PRESETS.ALL_TIME, label: 'All Time' }
  ];

  const handlePresetClick = (presetId) => {
    setPreset(presetId);
    setShowCustomPicker(false);
  };

  const handleCustomClick = () => {
    setShowCustomPicker(!showCustomPicker);
    if (!showCustomPicker) {
      // Initialize temp dates with current custom dates or defaults
      if (customStartDate) {
        setTempStartDate(formatDateForInput(customStartDate));
      }
      if (customEndDate) {
        setTempEndDate(formatDateForInput(customEndDate));
      }
    }
  };

  const handleApplyCustomRange = () => {
    if (tempStartDate && tempEndDate) {
      const start = new Date(tempStartDate);
      const end = new Date(tempEndDate);

      if (start <= end) {
        setCustomRange(start, end);
        setShowCustomPicker(false);
      } else {
        alert('Start date must be before end date');
      }
    }
  };

  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-cow-brown bg-opacity-60 backdrop-blur-sm rounded-cow shadow-lg p-4 mb-6 border border-cow-brown-light">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="text-cow-orange mr-2" size={20} />
            <h3 className="text-sm font-semibold text-cow-pink-light">Time Range</h3>
          </div>
          <div className="text-sm text-gray-400">
            {getFormattedRange()}
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedPreset === preset.id
                  ? 'bg-cow-orange text-white shadow-cow-glow-sm'
                  : 'bg-cow-brown-medium text-gray-300 hover:bg-cow-brown-light hover:text-cow-pink-light'
              }`}
            >
              {preset.label}
            </button>
          ))}

          {/* Custom Button */}
          <button
            onClick={handleCustomClick}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedPreset === TIME_RANGE_PRESETS.CUSTOM
                ? 'bg-cow-orange text-white shadow-cow-glow-sm'
                : 'bg-cow-brown-medium text-gray-300 hover:bg-cow-brown-light hover:text-cow-pink-light'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom Date Picker */}
        {showCustomPicker && (
          <div className="border-t border-cow-brown-light pt-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-cow-brown-medium border border-cow-brown-light rounded-md text-cow-pink-light focus:outline-none focus:ring-2 focus:ring-cow-orange transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-cow-brown-medium border border-cow-brown-light rounded-md text-cow-pink-light focus:outline-none focus:ring-2 focus:ring-cow-orange transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 mr-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomRange}
                disabled={!tempStartDate || !tempEndDate}
                className="px-4 py-2 bg-cow-orange text-white text-sm rounded-md hover:bg-cow-orange-hover transition-all duration-200 disabled:bg-cow-brown-light disabled:cursor-not-allowed disabled:text-gray-500"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
