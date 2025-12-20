import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  onThemeChange,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const updateTheme = () => {
      const storedTheme = localStorage.getItem("theme") as 'light' | 'dark' | 'system' | null
      setTheme(storedTheme || 'system')
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  const cycleTheme = useCallback(async () => {
    if (!buttonRef.current) return

    // Cycle: light -> dark -> system -> light
    const nextTheme: 'light' | 'dark' | 'system' = 
      theme === 'light' ? 'dark' : 
      theme === 'dark' ? 'system' : 
      'light'

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme)
        localStorage.setItem("theme", nextTheme)
        
        // Apply theme to DOM
        if (nextTheme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          document.documentElement.classList.toggle('dark', systemPrefersDark)
        } else {
          document.documentElement.classList.toggle('dark', nextTheme === 'dark')
        }
        
        onThemeChange?.(nextTheme)
      })
    }).ready

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    )

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  }, [theme, duration, onThemeChange])

  const getIcon = () => {
    if (theme === 'light') return <Sun className="h-4 w-4" />
    if (theme === 'dark') return <Moon className="h-4 w-4" />
    return <Laptop className="h-4 w-4" />
  }

  return (
    <button
      ref={buttonRef}
      onClick={cycleTheme}
      className={cn("inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors", className)}
      {...props}
    >
      {getIcon()}
      <span className="text-sm font-medium capitalize">{theme}</span>
      <span className="sr-only">Cycle theme</span>
    </button>
  )
}
