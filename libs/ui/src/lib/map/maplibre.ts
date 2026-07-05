/**
 * maplibre-gl exposes its runtime API on the module's default export. Its named
 * exports (Map, Marker, …) are synthesized by the dev server's loose interop but
 * are absent under the production esbuild build, so
 * `const { Map } = await import('maplibre-gl')` resolves to `undefined` in prod
 * and `new Map(...)` throws "n is not a constructor". Always load it via this
 * helper, which returns the real namespace in both dev and prod builds.
 */
export async function loadMaplibre(): Promise<typeof import('maplibre-gl')> {
  const mod = await import('maplibre-gl')
  return (mod as unknown as { default?: typeof import('maplibre-gl') }).default ?? mod
}
