import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

/**
 * Time Range Context for global time filtering
 */
const TimeRangeContext = createContext(null);

// Time range presets
export const TIME_RANGE_PRESETS = {
  LAST_30_DAYS: 'last30days',
  LAST_90_DAYS: 'last90days',
  YEAR_TO_DATE: 'ytd',
  ALL_TIME: 'alltime',
  CUSTOM: 'custom'
};

/**
 * Calculate date range based on preset
 */
const calculateDateRange = (preset, customStart = null, customEnd = null) => {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (preset) {
    case TIME_RANGE_PRESETS.LAST_30_DAYS: {
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }

    case TIME_RANGE_PRESETS.LAST_90_DAYS: {
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }

    case TIME_RANGE_PRESETS.YEAR_TO_DATE: {
      const startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      return { startDate, endDate };
    }

    case TIME_RANGE_PRESETS.ALL_TIME: {
      // Set to Jan 1, 2020 as CoW Protocol launched in 2021
      const startDate = new Date(2020, 0, 1, 0, 0, 0);
      return { startDate, endDate };
    }

    case TIME_RANGE_PRESETS.CUSTOM: {
      if (!customStart || !customEnd) {
        // Fallback to last 90 days if custom dates not provided
        const defaultStart = new Date(endDate);
        defaultStart.setDate(defaultStart.getDate() - 90);
        defaultStart.setHours(0, 0, 0, 0);
        return { startDate: defaultStart, endDate };
      }
      return {
        startDate: new Date(customStart),
        endDate: new Date(customEnd)
      };
    }

    default:
      // Default to last 90 days
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
  }
};

/**
 * TimeRangeProvider component
 */
export function TimeRangeProvider({ children }) {
  const [selectedPreset, setSelectedPreset] = useState(TIME_RANGE_PRESETS.LAST_90_DAYS);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  // Calculate current date range based on selected preset
  const dateRange = useMemo(() => {
    return calculateDateRange(selectedPreset, customStartDate, customEndDate);
  }, [selectedPreset, customStartDate, customEndDate]);

  /**
   * Set time range by preset
   */
  const setPreset = useCallback((preset) => {
    setSelectedPreset(preset);
  }, []);

  /**
   * Set custom date range
   */
  const setCustomRange = useCallback((startDate, endDate) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setSelectedPreset(TIME_RANGE_PRESETS.CUSTOM);
  }, []);

  /**
   * Get formatted date range string
   */
  const getFormattedRange = useCallback(() => {
    const { startDate, endDate } = dateRange;

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }, [dateRange]);

  /**
   * Check if a timestamp falls within the current range
   */
  const isInRange = useCallback((timestamp) => {
    const { startDate, endDate } = dateRange;
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to JS Date
    return date >= startDate && date <= endDate;
  }, [dateRange]);

  /**
   * Filter array of items by created timestamp
   */
  const filterByTimeRange = useCallback((items, timestampKey = 'created') => {
    if (!items || items.length === 0) return [];

    return items.filter(item => {
      const timestamp = item[timestampKey];
      if (!timestamp) return false;
      const { startDate, endDate } = dateRange;
      const date = new Date(timestamp * 1000);
      return date >= startDate && date <= endDate;
    });
  }, [dateRange]);

  const value = useMemo(() => ({
    selectedPreset,
    dateRange,
    customStartDate,
    customEndDate,
    setPreset,
    setCustomRange,
    getFormattedRange,
    isInRange,
    filterByTimeRange
  }), [selectedPreset, dateRange, customStartDate, customEndDate, setPreset, setCustomRange, getFormattedRange, isInRange, filterByTimeRange]);

  return (
    <TimeRangeContext.Provider value={value}>
      {children}
    </TimeRangeContext.Provider>
  );
}

/**
 * Hook to use time range context
 */
export function useTimeRange() {
  const context = useContext(TimeRangeContext);

  if (!context) {
    throw new Error('useTimeRange must be used within a TimeRangeProvider');
  }

  return context;
}
