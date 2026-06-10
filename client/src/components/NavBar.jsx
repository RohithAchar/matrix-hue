import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SoundToggle from './SoundToggle';
import InfoModal from './InfoModal';

function getPageTitle(pathname, params) {
  if (pathname === '/') return null;
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
  const params = useParams();
  const navigate = useNavigate();
  const title = getPageTitle(pathname, params);
  const isHome = pathname === '/';
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <nav className="navbar">
        <button className="navbar-logo" onClick={() => navigate('/')}>
          MatrixHue
        </button>
        {title && <span className="navbar-title">{title}</span>}
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
