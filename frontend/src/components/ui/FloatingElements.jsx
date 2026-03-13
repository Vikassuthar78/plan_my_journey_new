/* ── Lightweight Animated Background ── 
   Uses only CSS animations on 3 gradient orbs (no JS loops, no blur filters).
   Total DOM nodes: 4 (container + 3 orbs). Zero will-change, zero backdrop-filter.
*/
export default function FloatingElements() {
  return (
    <div className="nature-bg">
      {/* Three soft gradient orbs — CSS-only animation */}
      <div style={{
        position: 'absolute',
        width: '45vmax',
        height: '45vmax',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(76,175,80,0.10) 0%, transparent 70%)',
        top: '10%',
        left: '5%',
        animation: 'orbDrift1 30s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '40vmax',
        height: '40vmax',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30,136,229,0.08) 0%, transparent 70%)',
        top: '50%',
        right: '5%',
        animation: 'orbDrift2 35s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '35vmax',
        height: '35vmax',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)',
        bottom: '5%',
        left: '30%',
        animation: 'orbDrift3 40s ease-in-out infinite',
      }} />

      <style>{`
        @keyframes orbDrift1 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(4vw, -3vh); }
        }
        @keyframes orbDrift2 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(-3vw, 4vh); }
        }
        @keyframes orbDrift3 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(2vw, -2vh); }
        }
      `}</style>
    </div>
  );
}
