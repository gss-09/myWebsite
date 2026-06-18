import React, { useEffect, useState, lazy, Suspense } from "react";
import App from "./App";

// The pre-skeuomorphism portfolio. Lazy-loaded so its bundle (and
// framer-motion) only ships to phones, never to the desktop skeuo view.
const LegacyApp = lazy(() => import("./legacy/LegacyApp"));

// Phones get the old scrolling design; everything wider gets the
// skeuomorphic CRT terminal. Switches live on resize / rotate.
const MOBILE_QUERY = "(max-width: 767px)";

export default function Root() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (isMobile) {
    return (
      <Suspense fallback={null}>
        <LegacyApp />
      </Suspense>
    );
  }
  return <App />;
}
