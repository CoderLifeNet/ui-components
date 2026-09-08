import { useEffect, useMemo, useState } from "react";
import { Button } from "@coderlife/ui-core";
import SubpathButton from "@coderlife/ui-core/Button";
import { createAnalyticsRuntime, createMemoryAdapter } from "@coderlife/ui-core/analytics";
import { TrackingBoundary, UIExtensionsProvider, createAnalyticsExtension } from "@coderlife/ui-core/extensions";

export function App() {
  const [enabled, setEnabled] = useState(true);
  const [consentGranted, setConsentGranted] = useState(true);
  const [eventCount, setEventCount] = useState(0);

  const memory = useMemo(() => createMemoryAdapter(), []);
  const runtime = useMemo(
    () =>
      createAnalyticsRuntime([memory], {
        enabled,
        consent: {
          analyticsStorage: consentGranted ? "granted" : "denied",
          adStorage: "denied"
        }
      }),
    [memory]
  );

  useEffect(() => {
    runtime.update({
      enabled,
      consent: {
        analyticsStorage: consentGranted ? "granted" : "denied",
        adStorage: "denied"
      }
    });
  }, [consentGranted, enabled, runtime]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEventCount(memory.read().length);
    }, 50);

    return () => {
      window.clearInterval(timer);
    };
  }, [memory]);

  return (
    <UIExtensionsProvider initialConfig={{ enabled: true }} extensions={[createAnalyticsExtension(runtime)]}>
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>Vite Smoke</h1>
        <p>
          Event count: <span data-testid="event-count">{eventCount}</span>
        </p>

        <label style={{ display: "block", marginBottom: 8 }}>
          <input
            data-testid="enabled-toggle"
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.currentTarget.checked)}
          />
          Analytics enabled
        </label>

        <label style={{ display: "block", marginBottom: 16 }}>
          <input
            data-testid="consent-toggle"
            type="checkbox"
            checked={consentGranted}
            onChange={(event) => setConsentGranted(event.currentTarget.checked)}
          />
          Consent granted
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <Button data-testid="root-button" variant="contained">
            Root Button
          </Button>
          <SubpathButton data-testid="subpath-button" variant="outlined">
            Subpath Button
          </SubpathButton>
          <TrackingBoundary id="private-section" optOut>
            <Button data-testid="optout-button" variant="contained">
              Opted-Out Button
            </Button>
          </TrackingBoundary>
        </div>
      </div>
    </UIExtensionsProvider>
  );
}
