export function GlassBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="aurora-orb aurora-orb-a" />
      <div className="aurora-orb aurora-orb-b" />
      <div className="aurora-orb aurora-orb-c" />
      <div className="glass-noise" />
    </div>
  );
}
