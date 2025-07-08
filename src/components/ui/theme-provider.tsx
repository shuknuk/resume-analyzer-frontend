"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// This corrected interface now matches the expected props for NextThemesProvider
export interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: "class" | "data-theme" | `data-${string}`
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}