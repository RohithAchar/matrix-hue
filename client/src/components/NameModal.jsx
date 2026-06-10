import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useSession } from '../hooks/useSession';
import { useSound } from '../hooks/useSound';

export default function NameModal({ onSuccess }) {
  const { createSession } = useSession();
  const { playClick } = useSound();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.15, ease: 'power2.out' }
    );
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
    );
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    playClick();
    setSubmitting(true);
    setError(null);
    try {
      await createSession(name.trim());
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="name-modal-overlay" ref={overlayRef}>
      <div className="name-modal" ref={modalRef}>
        <h2>Enter your name</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            autoFocus
            disabled={submitting}
          />
          <button type="submit" disabled={!name.trim() || submitting}>
            {submitting ? 'Creating...' : 'Start'}
          </button>
        </form>
        {error && <p className="name-modal-error">{error}</p>}
      </div>
    </div>
  );
}
