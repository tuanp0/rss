"use client"
import { useEffect } from "react"

export default function SerwistRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing
          newSW?.addEventListener("statechange", () => {
            if (newSW.state === "installed" && navigator.serviceWorker.controller) {
              // show a toast/banner here
              console.log("New version available — reload to update")
            }
          })
        })
      })
    }
  }, [])
  return null
}