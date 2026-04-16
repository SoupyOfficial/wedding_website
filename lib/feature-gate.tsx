import { getFeatureFlag, type FeatureFlagKey } from "@/lib/config/feature-flags";
import PageDisabled from "@/components/PageDisabled";

/**
 * Server-side feature flag gate.
 * Returns the PageDisabled component if the flag is disabled, or null if enabled.
 * Usage in server components:
 *   const gate = await checkFeatureFlag("ourStoryPageEnabled");
 *   if (gate) return gate;
 */
export async function checkFeatureFlag(flag: FeatureFlagKey): Promise<JSX.Element | null> {
  const enabled = await getFeatureFlag(flag);
  if (!enabled) return <PageDisabled />;
  return null;
}
