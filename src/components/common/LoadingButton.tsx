import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export default function LoadingButton({
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${className} ${loading ? 'cursor-not-allowed' : ''} disabled:opacity-50`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}