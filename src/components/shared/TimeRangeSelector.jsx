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
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="text-blue-500 mr-2" size={20} />
            <h3 className="text-sm font-semibold text-gray-900">Time Range</h3>
          </div>
          <div className="text-sm text-gray-600">
            {getFormattedRange()}
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                selectedPreset === preset.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}

          {/* Custom Button */}
          <button
            onClick={handleCustomClick}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              selectedPreset === TIME_RANGE_PRESETS.CUSTOM
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom Date Picker */}
        {showCustomPicker && (
          <div className="border-t pt-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomRange}
                disabled={!tempStartDate || !tempEndDate}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
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
