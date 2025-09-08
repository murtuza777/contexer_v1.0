// =============================================================================
// STATE RECOVERY NOTIFICATION
// =============================================================================
// Shows when state is recovered from persistence

import React, { useState, useEffect } from 'react';

export function StateRecoveryNotification() {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Simple notification logic - can be enhanced later
    const hasPersistedState = localStorage.getItem('contexer-state');
    if (hasPersistedState) {
      setShowNotification(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowNotification(false), 3000);
    }
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">State recovered successfully</span>
        <button
          onClick={() => setShowNotification(false)}
          className="ml-2 text-white hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}