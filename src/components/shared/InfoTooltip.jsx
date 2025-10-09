import React, { useState } from 'react';
import { Info } from 'lucide-react';

/**
 * InfoTooltip component for displaying additional information
 */
export function InfoTooltip({ content, position = 'top' }) {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-gray-400 hover:text-gray-600 transition"
      >
        <Info size={16} />
      </button>
      {show && (
        <div
          className={`absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap ${positionClasses[position]}`}
        >
          {content}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1' :
            position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1' :
            position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1' :
            'left-0 top-1/2 -translate-y-1/2 -translate-x-1'
          }`}></div>
        </div>
      )}
    </div>
  );
}
