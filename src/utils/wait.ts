import type { Locator } from "@playwright/test";

/**
 * Clicks `trigger` until `target` becomes visible.
 *
 * Angular Material occasionally swallows the first click on a control that has
 * rendered but is not yet wired up. Retrying the click is deterministic; a
 * fixed sleep before it would not be.
 */
export async function clickUntilVisible(
  trigger: Locator,
  target: Locator,
  { timeout = 10_000, interval = 1_000 } = {},
): Promise<void> {
  const deadline = Date.now() + timeout;

  for (;;) {
    await trigger.click();
    try {
      await target.waitFor({ state: "visible", timeout: interval });
      return;
    } catch (error) {
      if (Date.now() >= deadline) throw error;
    }
  }
}
