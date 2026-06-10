import { render, screen, fireEvent } from '@testing-library/react';
import { useSound } from '../hooks/useSound';
import SoundToggle from '../components/SoundToggle';

beforeEach(() => {
  localStorage.clear();
});

function TestHook() {
  const sound = useSound();
  return (
    <div>
      <span data-testid="muted">{sound.muted ? 'true' : 'false'}</span>
      <button data-testid="toggle" onClick={sound.toggleMute}>Toggle</button>
      <button data-testid="click" onClick={sound.playClick}>Click</button>
      <button data-testid="round-start" onClick={sound.playRoundStart}>RoundStart</button>
      <button data-testid="tick" onClick={sound.playTick}>Tick</button>
      <button data-testid="fade" onClick={sound.playFade}>Fade</button>
      <button data-testid="score" onClick={() => sound.playScore(7)}>Score</button>
      <button data-testid="leaderboard" onClick={sound.playLeaderboard}>Leaderboard</button>
    </div>
  );
}

it('returns all expected functions and muted state', () => {
  render(<TestHook />);
  expect(screen.getByTestId('muted').textContent).toBe('false');
  expect(screen.getByTestId('toggle')).toBeInTheDocument();
  expect(screen.getByTestId('click')).toBeInTheDocument();
  expect(screen.getByTestId('round-start')).toBeInTheDocument();
  expect(screen.getByTestId('tick')).toBeInTheDocument();
  expect(screen.getByTestId('fade')).toBeInTheDocument();
  expect(screen.getByTestId('score')).toBeInTheDocument();
  expect(screen.getByTestId('leaderboard')).toBeInTheDocument();
});

it('toggles mute state and persists to localStorage', () => {
  render(<TestHook />);
  expect(screen.getByTestId('muted').textContent).toBe('false');
  fireEvent.click(screen.getByTestId('toggle'));
  expect(screen.getByTestId('muted').textContent).toBe('true');
  expect(localStorage.getItem('soundMuted')).toBe('true');
  fireEvent.click(screen.getByTestId('toggle'));
  expect(screen.getByTestId('muted').textContent).toBe('false');
  expect(localStorage.getItem('soundMuted')).toBe('false');
});

it('loads mute state from localStorage', () => {
  localStorage.setItem('soundMuted', 'true');
  render(<TestHook />);
  expect(screen.getByTestId('muted').textContent).toBe('true');
});

it('play functions do not throw when AudioContext is unavailable (graceful degradation)', () => {
  render(<TestHook />);
  expect(() => fireEvent.click(screen.getByTestId('click'))).not.toThrow();
  expect(() => fireEvent.click(screen.getByTestId('round-start'))).not.toThrow();
  expect(() => fireEvent.click(screen.getByTestId('tick'))).not.toThrow();
  expect(() => fireEvent.click(screen.getByTestId('fade'))).not.toThrow();
  expect(() => fireEvent.click(screen.getByTestId('score'))).not.toThrow();
  expect(() => fireEvent.click(screen.getByTestId('leaderboard'))).not.toThrow();
});

it('SoundToggle renders and toggles mute', () => {
  render(<SoundToggle />);
  const btn = screen.getByRole('button');
  expect(btn).toBeInTheDocument();
  expect(btn.getAttribute('aria-label')).toBe('Mute sound');
  fireEvent.click(btn);
  expect(btn.getAttribute('aria-label')).toBe('Unmute sound');
  fireEvent.click(btn);
  expect(btn.getAttribute('aria-label')).toBe('Mute sound');
});
