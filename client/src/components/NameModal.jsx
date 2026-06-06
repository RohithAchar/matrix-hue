/*
 * NameModal.jsx — Display name entry modal
 *
 * Shown on first visit when player selects a mode+difficulty
 *
 * TODO:
 * - Centered overlay with dark backdrop
 * - Input field for display name (placeholder: "Enter your name")
 * - "Start" button that calls createSession from useSession hook
 * - GSAP entrance: fade in + scale up (0.3s, power2.out)
 * - Button disabled when input is empty
 * - Loading state on submit ("Creating...")
 * - Error state: inline message on network failure
 * - On success: close modal, start game navigation
 * - Sound: playClick on submit
 */

export default function NameModal({ onSubmit }) {
  return (
    <div className="name-modal-overlay">
      <div className="name-modal">
        <h2>Enter your name</h2>
        <input placeholder="Enter your name" />
        <button>Start</button>
      </div>
    </div>
  );
}
