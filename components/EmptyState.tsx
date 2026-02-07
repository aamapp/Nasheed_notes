import React from 'react';

interface EmptyStateProps {
  message: string;
  subMessage?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, subMessage, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
      <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-2">
        <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-medium text-text mb-1">{message}</h3>
        {subMessage && <p className="text-sm text-muted">{subMessage}</p>}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};