/**
 * Fixní, non-interaktivní vrstva tří rozostřených barevných "mlhovin", které
 * se pomalu a nekonečně přesouvají po obrazovce (čistě CSS `@keyframes`, žádný
 * JS/canvas — nulová zátěž na výkon). Vytváří dojem živého, dýchajícího
 * pozadí i za statickým obsahem. Umísťuje se jednou v root layoutu.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="aurora-blob aurora-blob--one" />
      <div className="aurora-blob aurora-blob--two" />
      <div className="aurora-blob aurora-blob--three" />
      <div className="absolute inset-0 bg-void/40" />
      <div className="grain absolute inset-0 opacity-[0.025]" />
    </div>
  );
}