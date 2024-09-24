import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "../lib/utils"

// Alert Component
export const Alert = ({ children, variant = 'default', className = '', ...props }) => {
  const variantClasses = {
    default: 'bg-blue-100 border-blue-500 text-blue-700',
    destructive: 'bg-red-100 border-red-500 text-red-700',
  };

  return (
    <div className={`border-l-4 p-4 ${variantClasses[variant]} ${className}`} role="alert" {...props}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm ${className}`} {...props}>{children}</p>
);

// Button Component
export const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const variantClasses = {
    default: 'bg-blue-500 hover:bg-blue-600 text-white',
    outline: 'border border-gray-300 hover:bg-gray-100 text-gray-700',
  };

  return (
    <button
      className={`px-4 py-2 rounded-md transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
export const Input = React.forwardRef(({ className = '', ...props }, ref) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    ref={ref}
    {...props}
  />
));

// Textarea Component
export const Textarea = React.forwardRef(({ className = '', ...props }, ref) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    ref={ref}
    {...props}
  />
));

// Label Component
export const Label = React.forwardRef(({ className = '', ...props }, ref) => (
  <label
    className={`block text-sm font-medium text-gray-700 ${className}`}
    ref={ref}
    {...props}
  />
));

// Card Components
export const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white shadow-md rounded-lg overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props} />
);

export const CardTitle = ({ className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props} />
);

export const CardContent = ({ className = '', ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props} />
);