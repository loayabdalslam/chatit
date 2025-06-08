import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function usePageTracking(page: string) {
  const trackPageVisit = useMutation(api.contact.trackPageVisit);

  useEffect(() => {
    // Generate a simple session ID if not exists
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('sessionId', sessionId);
    }

    // Track the page visit
    trackPageVisit({
      page,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
      sessionId,
    }).catch(console.error);
  }, [page, trackPageVisit]);
} 