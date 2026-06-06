/*
 * JoinChallenge.jsx — Share code input screen
 *
 * Shown when user selects "Join Challenge" in Play with Friends mode
 *
 * TODO:
 * - 6-char text input, auto-uppercase, maxLength 6
 * - "Join" button calls GET /api/challenges/:code
 * - On 404: inline error "No challenge found with that code"
 * - On 200: navigate to /play/friends/:shareCode
 * - Loading spinner on button while fetching
 * - Sound: playClick on submit
 */

export default function JoinChallenge() {
  return (
    <div className="join-challenge">
      <h2>Join Challenge</h2>
    </div>
  );
}
