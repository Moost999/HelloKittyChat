"use client"

// Simple hook to provide haptic feedback on mobile devices
export function useHapticFeedback() {
  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }

  const lightTap = () => vibrate(10)
  const mediumTap = () => vibrate(20)
  const heavyTap = () => vibrate([30, 20, 30])
  const successTap = () => vibrate([10, 30, 10])
  const errorTap = () => vibrate([50, 30, 50, 30])

  return {
    lightTap,
    mediumTap,
    heavyTap,
    successTap,
    errorTap,
    isSupported: typeof navigator !== "undefined" && !!navigator.vibrate,
  }
}

