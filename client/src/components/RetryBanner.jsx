import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function RetryBanner({ message, onRetry, onDismiss }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(ref.current, { y: 100 }, { y: 0, duration: 0.3, ease: 'power2.out' });
    }
  }, []);

  return (
    <div className="retry-banner" ref={ref}>
      <span className="retry-banner-message">{message}</span>
      <div className="retry-banner-actions">
        <button className="retry-banner-retry" onClick={onRetry}>Retry</button>
        <button className="retry-banner-dismiss" onClick={onDismiss}>✕</button>
      </div>
    </div>
  );
}
