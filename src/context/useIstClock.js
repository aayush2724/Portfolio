import { useEffect, useState } from "react"

const istTime = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" })

/** Local time in Mysore, to the minute ("09:41"). */
export function useIstClock() {
  const [time, setTime] = useState(istTime)
  useEffect(() => {
    const id = setInterval(() => setTime(istTime()), 15000)
    return () => clearInterval(id)
  }, [])
  return time
}
