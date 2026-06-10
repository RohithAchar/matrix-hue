import { Routes, Route } from 'react-router-dom';
import { SessionProvider, useSession } from './hooks/useSession';

function HomePage() {
  const { isLoggedIn, loading } = useSession();

  if (loading) return null;

  return (
    <div>
      <h1>Hello MatrixHue</h1>
      {isLoggedIn ? (
        <p>Welcome back!</p>
      ) : (
        <p>Click a mode to get started</p>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </SessionProvider>
  );
}
