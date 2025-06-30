"use client"

import { useToast } from "@/hooks/use-toast"
import { Toaster as Sonner } from "sonner"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <Sonner />
  )
}
