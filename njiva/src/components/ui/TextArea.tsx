// components/ui/TextArea.tsx
'use client'

console.log(`[TEXTAREA.TSX] Mounted**********************`);

import { forwardRef, useEffect, useRef } from 'react'
import { cva } from 'class-variance-authority'

const textAreaVariants = cva(
 'w-full rounded-lg cursor-text max-h-24 transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/20',
 {
   variants: {
     variant: {
       default: 'bg-background text-foreground border border-foreground/20 placeholder:text-foreground/50 text-lg py-4 px-6',
       error: 'bg-background border-red-500 text-foreground placeholder:text-foreground/50 text-lg py-4 px-6'
     }
   },
   defaultVariants: {
     variant: 'default'
   }
 }
)

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
 autoResize?: boolean
 error?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
 ({ className, autoResize, error, onChange, ...props }, ref) => {
   const textAreaRef = useRef<HTMLTextAreaElement>(null)

   useEffect(() => {
     if (autoResize && textAreaRef.current) {
       textAreaRef.current.style.height = 'auto'
       textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
     }
   }, [autoResize, props.value])

   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
     if (autoResize) {
       e.target.style.height = 'auto'
       e.target.style.height = `${e.target.scrollHeight}px`
     }
     onChange?.(e)
   }

   return (
     <div className="relative">
       <textarea
         ref={(node) => {
           if (typeof ref === 'function') {
             ref(node)
           } else if (ref) {
             ref.current = node
           }
           textAreaRef.current = node
         }}
         onChange={handleChange}
         className={textAreaVariants({ variant: error ? 'error' : 'default', className })}
         rows={3}
         {...props}
       />
       {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
     </div>
   )
 }
)

TextArea.displayName = 'TextArea'

export default TextArea