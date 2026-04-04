"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-slate-400 hover:text-white"
    >
      <LogOut className="w-5 h-5" />
    </Button>
  )
}