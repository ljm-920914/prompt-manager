"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const toggleTheme = () => {
    const current = resolvedTheme || theme
    setTheme(current === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="text-[#6b6b7b]"><Sun className="h-5 w-5" /></Button>
  }

  const isDark = (resolvedTheme || theme) === "dark"

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}
      title={isDark ? "切换到日间模式" : "切换到夜间模式"}
      className="text-[#6b6b7b] hover:text-white">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
