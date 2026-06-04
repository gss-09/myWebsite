import { useEffect, useState } from "react";

// Isolated so the 1s tick only re-renders this span, not the whole app.
export default function Clock() {
  const [t, setT] = useState("--:--:--");
  useEffect(() => {
    const fmt = () =>
      setT(new Date().toLocaleTimeString("en-US", { hour12: false }));
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="clock">{t}</span>;
}
