/**
 * The "sensor field" behind every page: a fixed camera-viewfinder layer
 * (dot grid, soft ink pools, corner registration marks) that glass panels
 * frost as content scrolls over it. Monochrome to stay on Brand System v1.1.
 *
 * Pure CSS: no network requests, no JS, and fixed so it is composited once
 * rather than repainted on scroll. Hidden under prefers-reduced-transparency.
 */
export function SiteBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="site-backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft ink pools give the glass tonal variation to blur */}
      <div className="absolute inset-0 [background:radial-gradient(40rem_28rem_at_82%_18%,rgba(10,10,10,0.07),transparent_70%),radial-gradient(34rem_26rem_at_8%_62%,rgba(10,10,10,0.05),transparent_70%),radial-gradient(30rem_22rem_at_70%_95%,rgba(10,10,10,0.05),transparent_70%)]" />

      {/* Sensor dot grid, fading toward the edges */}
      <div className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.11)_1px,transparent_1.2px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_100%)]" />

      {/* Viewfinder registration marks (desktop only; on phones they would
          sit on top of content) */}
      <ViewfinderCorners />
    </div>
  );
}

/** Four L-shaped corner marks; the top pair sits just below the nav bar. */
function ViewfinderCorners() {
  const corner = "absolute hidden h-10 w-10 border-ink/20 md:block";
  return (
    <>
      <span className={`${corner} left-5 top-[100px] border-l-[1.5px] border-t-[1.5px]`} />
      <span className={`${corner} right-5 top-[100px] border-r-[1.5px] border-t-[1.5px]`} />
      <span className={`${corner} bottom-5 left-5 border-b-[1.5px] border-l-[1.5px]`} />
      <span className={`${corner} bottom-5 right-5 border-b-[1.5px] border-r-[1.5px]`} />
    </>
  );
}
