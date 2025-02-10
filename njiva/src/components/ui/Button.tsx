// components/ui/Button.tsx

import { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

console.log(`[BUTTONS.TSX] Mounted**********************`);

// Define the styles for the button using class-variance-authority (cva)
const buttonVariants = cva(
  'rounded-lg font-medium transition-all duration-200 cursor-pointer', // Base styles for all buttons
  {
    variants: {
      variant: {
        primary: 'bg-foreground text-background hover:bg-foreground/90 active:scale-95',
        secondary: 'bg-background text-foreground border border-foreground/20 hover:bg-foreground/10 active:scale-95',
        ghost: 'text-foreground/70 hover:text-foreground hover:bg-foreground/10 hover:scale-105 active:scale-95',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-3 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none', // Styles for when the button is disabled
        false: '', // No additional styles if not disabled
      },
    },
    defaultVariants: {
      variant: 'primary', // Default button type
      size: 'md', // Default size
      fullWidth: false, // Default width
      disabled: false, // Default is not disabled
    },
  }
);

// Define the props for the Button component
interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>, // Omit `disabled` from HTML attributes
    VariantProps<typeof buttonVariants> {
  disabled?: boolean; // Redefine `disabled` to match the VariantProps definition
}

// Button component implementation
const Button = ({
  variant,
  size,
  fullWidth,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={buttonVariants({ variant, size, fullWidth, disabled, className })} // Apply styles based on props
      disabled={disabled} // HTML disabled attribute
      aria-disabled={disabled} // Accessibility attribute
      {...props} // Spread other props
    >
      {children}
    </button>
  );
};

export default Button;
