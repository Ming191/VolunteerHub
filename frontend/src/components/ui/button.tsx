/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { RippleButton, RippleButtonRipples, type RippleButtonProps } from "@/components/animate-ui/components/buttons/ripple"
import { buttonVariants } from "@/components/animate-ui/components/buttons/button"

// Create a wrapper that includes ripples by default
const Button = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ children, ...props }, ref) => {
    const content = (
      <>
        {children}
        <RippleButtonRipples />
      </>
    );

    return (
      <RippleButton ref={ref} {...props}>
        {content}
      </RippleButton>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants }

export type ButtonProps = RippleButtonProps
