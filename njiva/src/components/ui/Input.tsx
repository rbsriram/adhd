// components/ui/Input.tsx
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

console.log(`[INPUT.TSX] Mounted**********************`);

const inputVariants = cva(
  'w-full rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/20 cursor-text',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border border-foreground/20 placeholder:text-foreground/50 text-lg py-4 px-6', // Made text larger and increased padding
        error: 'bg-background border-red-500 text-foreground placeholder:text-foreground/50 text-lg py-4 px-6'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

interface InputProps 
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, error, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          className={inputVariants({ variant: error ? 'error' : variant, className })}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;