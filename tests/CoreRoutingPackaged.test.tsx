import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Button as RootButton
} from "@coderlifenet/ui-core";
import { TrackingBoundary, UIExtensionsProvider, createAnalyticsExtension } from "@coderlifenet/ui-core/extensions";
import { createAnalyticsRuntime, createMemoryAdapter } from "@coderlifenet/ui-core/analytics";
import {
  Button as SubpathButtonNamed,
  default as SubpathButtonDefault
} from "@coderlifenet/ui-core/Button";

describe("packaged core routing", () => {
  it("keeps root and subpath Button identities aligned", () => {
    expect(RootButton).toBe(SubpathButtonNamed);
    expect(SubpathButtonNamed).toBe(SubpathButtonDefault);
  });

  it("emits equivalent events from root and subpath Button under one provider", async () => {
    const user = userEvent.setup();
    const memory = createMemoryAdapter();
    const runtime = createAnalyticsRuntime([memory], {
      enabled: true,
      consent: {
        analyticsStorage: "granted",
        adStorage: "denied"
      }
    });

    render(
      <UIExtensionsProvider initialConfig={{ enabled: true }} extensions={[createAnalyticsExtension(runtime)]}>
        <TrackingBoundary id="packaged-route">
          <RootButton variant="contained">Root Route</RootButton>
          <SubpathButtonNamed variant="contained">Subpath Route</SubpathButtonNamed>
        </TrackingBoundary>
      </UIExtensionsProvider>
    );

    await user.click(screen.getByRole("button", { name: "Root Route" }));
    await user.click(screen.getByRole("button", { name: "Subpath Route" }));

    const events = memory.read();
    expect(events).toHaveLength(2);
    for (const event of events) {
      expect(event.type).toBe("ui.button.click");
      expect(event.component).toBe("Button");
      expect(event.metadata).toEqual({ variant: "contained", color: "primary" });
    }
  });
});
