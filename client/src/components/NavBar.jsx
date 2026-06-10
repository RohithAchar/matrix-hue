import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SoundToggle from './SoundToggle';
import InfoModal from './InfoModal';

const TODAY = new Date().toISOString().slice(0, 10);

function getPageTitle(pathname, params) {
  if (pathname === '/') return null;
  if (pathname === '/rooms') return 'Your Rooms';
  if (pathname.startsWith('/play/single')) return 'Single Player';
  if (pathname.startsWith('/play/friends')) {
    return params.code ? 'Friends Challenge' : 'Play with Friends';
  }
  if (pathname.startsWith('/play/global')) return 'Global Challenge';
  if (pathname.startsWith('/leaderboard/friends')) return 'Leaderboard';
  if (pathname.startsWith('/leaderboard/global')) return 'Global Leaderboard';
  return null;
}

export default function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/';
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <nav className="navbar">
        <button className="navbar-logo" onClick={() => navigate('/')}>
          MatrixHue
        </button>
        <div className="navbar-center">
          <button className="navbar-lb-btn" onClick={() => navigate(`/leaderboard/global/easy/${TODAY}`)}>
            Leaderboard
          </button>
          <span className="navbar-sep">|</span>
          <button className="navbar-lb-btn" onClick={() => navigate('/rooms')}>
            Rooms
          </button>
        </div>
        <div className="navbar-right">
          {!isHome && (
            <button className="navbar-back" onClick={() => navigate('/')}>
              Home
            </button>
          )}
          <SoundToggle />
          <button className="navbar-info" onClick={() => setShowInfo(true)}>
            ?
          </button>
        </div>
      </nav>
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </>
  );
}
