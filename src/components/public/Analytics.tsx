"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    function checkConsent() {
      setConsented(localStorage.getItem("cookie_consent") === "accepted");
    }
    checkConsent();
    window.addEventListener("cookie_consent_change", checkConsent);
    return () =>
      window.removeEventListener("cookie_consent_change", checkConsent);
  }, []);

  if (!gaId || !consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
