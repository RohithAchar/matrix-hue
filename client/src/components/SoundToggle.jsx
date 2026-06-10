import { useSound } from '../hooks/useSound';

export default function SoundToggle() {
  const { muted, toggleMute } = useSound();

  return (
    <button
      className="sound-toggle"
      onClick={toggleMute}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '\uD83D\uDD07' : '\uD83D\uDD0A'}
    </button>
  );
}
