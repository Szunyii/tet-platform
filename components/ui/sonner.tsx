"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// Az app light-only (nincs téma-váltó/ThemeProvider), ezért theme="light" fixen: egy
// rendszerbeállítást követő téma sötét OS mellett "dark"-ot adna, és a sonner
// data-sonner-theme="dark" a fehér popoveren olvashatatlan (pl. #e8e8e8) szöveget
// renderelne. A fontFamily inline stílusként kell: a sonner futásidőben beszúrt,
// réteg nélküli CSS-e felülírja a Tailwind rétegzett utility-jeit, csak az inline
// stílus nyer.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          fontFamily: "var(--font-sans)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
