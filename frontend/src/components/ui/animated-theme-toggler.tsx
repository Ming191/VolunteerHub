import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Force light theme always - dark mode is disabled
    setIsDark(false);
    // Remove any dark class if it exists
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  const toggleTheme = useCallback(async () => {
    // Dark mode is disabled - do nothing
    // Keep light theme only
    console.log("Theme switching is disabled. Light theme is always active.");
    return;
  }, [isDark, duration]);

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      {...props}
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
