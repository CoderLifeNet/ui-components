import { useEffect, useState } from "react";
import { Button } from "@coderlifenet/ui-core";
import {
  createAnalyticsRuntime,
  createMemoryAdapter,
} from "@coderlifenet/ui-core/analytics";
import {
  TrackingBoundary,
  UIExtensionsProvider,
  createAnalyticsExtension,
} from "@coderlifenet/ui-core/extensions";

export default function ButtonExample() {
  const [memory] = useState(() => createMemoryAdapter());
  const [runtime] = useState(() =>
    createAnalyticsRuntime([memory], { enabled: true }),
  );
  const [extensions] = useState(() => [createAnalyticsExtension(runtime)]);
  const [consent, setConsent] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [events, setEvents] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setEvents(memory.read().length),
      100,
    );
    return () => {
      window.clearInterval(timer);
      runtime.dispose();
      memory.clear();
    };
  }, [memory, runtime]);
  function changeConsent(granted: boolean) {
    runtime.update({
      consent: {
        analyticsStorage: granted ? "granted" : "denied",
        adStorage: "denied",
      },
    });
    setConsent(granted);
  }
  return (
    <UIExtensionsProvider
      initialConfig={{ enabled: true }}
      extensions={extensions}
    >
      <div className="analytics-fixture">
        <div className="fixture-controls">
          <label>
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => changeConsent(event.target.checked)}
            />{" "}
            Demo analytics consent
          </label>
          <span className="badge">Memory only</span>
        </div>
        <div className="button-row">
          <Button
            variant="contained"
            disableElevation
            onClick={() => setClicks((value) => value + 1)}
          >
            Run action
          </Button>
          <TrackingBoundary id="private-demo" optOut>
            <Button
              variant="outlined"
              onClick={() => setClicks((value) => value + 1)}
            >
              Opted-out action
            </Button>
          </TrackingBoundary>
        </div>
        <div className="event-metrics">
          <div>
            <strong data-testid="actions">{clicks}</strong>
            <span>Actions completed</span>
          </div>
          <div>
            <strong data-testid="events">{events}</strong>
            <span>Events in memory</span>
          </div>
        </div>
        <p className="muted">
          Fixture events only. Consent starts denied; ordinary actions always
          work. No demo data is transmitted.
        </p>
        <code>ui.button.click / Button / click</code>
      </div>
    </UIExtensionsProvider>
  );
}
