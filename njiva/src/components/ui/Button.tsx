// components/ui/Button.tsx

import { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'rounded-lg font-medium transition-all duration-200', // Added transition-all and duration
  {
    variants: {
      variant: {
        primary: 'bg-foreground text-background hover:opacity-90',
        secondary: 'bg-background text-foreground border border-foreground/20 hover:bg-foreground/10',
        ghost: 'text-foreground/70 hover:text-foreground hover:bg-foreground/10 hover:scale-105' // Added scale effect on hover
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-3 text-lg'
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false
    }
  }
);

interface ButtonProps 
 extends ButtonHTMLAttributes<HTMLButtonElement>,
   VariantProps<typeof buttonVariants> {}

const Button = ({
 variant,
 size,
 fullWidth,
 className,
 children,
 ...props
}: ButtonProps) => {
 return (
   <button
     className={buttonVariants({ variant, size, fullWidth, className })}
     {...props}
   >
     {children}
   </button>
 );
};

export default Button;