import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const SECTIONS = [
  {
    id: 'about',
    label: 'About',
    title: 'What is MatrixHue?',
    content: (
      <>
        <p>A color memory game that tests your ability to see, remember, and recreate colors.</p>
        <p>Three difficulty levels — Easy, Medium, Hard — and three modes to play: Solo practice, Friend challenges with share codes, and daily Global competitions.</p>
        <p>Train your eye. Master the spectrum.</p>
      </>
    ),
  },
  {
    id: 'how',
    label: 'How It Works',
    title: 'How to Play',
    content: (
      <>
        <p>Each game has <strong>5 rounds</strong>. In every round:</p>
        <ol>
          <li><strong>Memorize</strong> — A color is shown. You have limited time to remember it.</li>
          <li><strong>Fade</strong> — The color disappears.</li>
          <li><strong>Recreate</strong> — Use the Hue, Saturation, and Lightness sliders to rebuild the color from scratch.</li>
          <li><strong>Reveal</strong> — See how close you got, get your score, and a personalized roast.</li>
        </ol>
        <p><strong>Easy (6s):</strong> More time, colors span distinct hue ranges.</p>
        <p><strong>Medium (4s):</strong> Less time, distraction labels appear over the swatch.</p>
        <p><strong>Hard (2s):</strong> Very little time, distractions change faster.</p>
      </>
    ),
  },
  {
    id: 'scoring',
    label: 'Scoring',
    title: 'How Scoring Works',
    content: (
      <>
        <p>Your guess is compared to the target using <strong>CIEDE2000</strong> — the industry standard for measuring perceived color difference.</p>
        <p>Each round is scored <strong>out of 10</strong>. The better your match, the higher your score. Max total: <strong>50 points</strong>.</p>
        <p><strong>Hue matters most.</strong> Getting the hue wrong costs up to 3 extra points — even if saturation and lightness are close.</p>
        <div className="info-scoring-table">
          <div className="info-scoring-row"><span>Perfect match</span><span>10.0 / 10</span></div>
          <div className="info-scoring-row"><span>Very close</span><span>8 – 10</span></div>
          <div className="info-scoring-row"><span>Nearly there</span><span>6 – 8</span></div>
          <div className="info-scoring-row"><span>Decent try</span><span>4 – 6</span></div>
          <div className="info-scoring-row"><span>Way off</span><span>2 – 4</span></div>
          <div className="info-scoring-row"><span>Complete miss</span><span>0 – 2</span></div>
        </div>
      </>
    ),
  },
];

export default function InfoModal({ onClose }) {
  const [activeSection, setActiveSection] = useState('about');
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const section = SECTIONS.find((s) => s.id === activeSection);

  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.15, ease: 'power2.out' }
    );
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.95, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
    );
  }, []);

  return (
    <div className="info-overlay" ref={overlayRef} onClick={onClose}>
      <div className="info-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <div className="info-tabs">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`info-tab ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="info-body">
          <h2 className="info-title">{section.title}</h2>
          <div className="info-content">{section.content}</div>
        </div>
        <button className="info-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
