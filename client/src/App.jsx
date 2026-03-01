import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from './api';
import Community from './pages/Community';
import MyBooks from './pages/MyBooks';
import ReadingList from './pages/ReadingList';
import BookDetail from './pages/BookDetail';
import Search from './pages/Search';
import Auth from './pages/Auth';
import './App.css';

// User context - in production, this would come from auth
export const useCurrentUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      usersAPI.getById(storedUserId)
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('userId'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const setCurrentUser = (userData) => {
    if (userData) {
      localStorage.setItem('userId', userData._id);
      setUser(userData);
    } else {
      localStorage.removeItem('userId');
      setUser(null);
    }
  };

  return { user, loading, setCurrentUser };
};

// Protected Route component
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Inner app component that has access to router context
function AppContent({ user, loading, setCurrentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('userId');
    setCurrentUser(null);
    setMobileMenuOpen(false);
  }, [setCurrentUser]);

  if (loading) {
    return (
      <div className="loading" style={{ height: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav>
        <div className="container nav-container">
          <Link to="/" className="nav-logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            BookList
          </Link>

          {/* Desktop nav links */}
          <ul className="nav-links-desktop">
            <li><NavLink to="/">Esplora</NavLink></li>
            <li><NavLink to="/search">Cerca</NavLink></li>
            {user && (
              <>
                <li><NavLink to="/my-books">I Miei Libri</NavLink></li>
                <li><NavLink to="/reading-list">Lista</NavLink></li>
              </>
            )}
          </ul>

          {/* Desktop auth */}
          <div className="nav-auth-desktop">
            {user ? (
              <div className="nav-user">
                <div className="nav-user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="nav-user-name">{user.name}</span>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  Esci
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Accedi
              </Link>
            )}
          </div>

          {/* Hamburger button (mobile only) */}
          <button
            className={`nav-hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile slide-out menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-menu-links">
          <li><NavLink to="/">Esplora</NavLink></li>
          <li><NavLink to="/search">Cerca</NavLink></li>
          {user && (
            <>
              <li><NavLink to="/my-books">I Miei Libri</NavLink></li>
              <li><NavLink to="/reading-list">Lista di Lettura</NavLink></li>
            </>
          )}
        </ul>
        <div className="mobile-menu-auth">
          {user ? (
            <div className="mobile-menu-user">
              <div className="nav-user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="mobile-menu-user-name">{user.name}</span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
                Esci
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Accedi
            </Link>
          )}
        </div>
      </div>

      <main>
        <div className="container">
          <Routes>
            <Route path="/" element={<Community user={user} />} />
            <Route path="/search" element={<Search user={user} />} />
            <Route path="/login" element={
              user ? <Navigate to="/" replace /> : <Auth setUser={setCurrentUser} />
            } />
            <Route path="/my-books" element={
              <ProtectedRoute user={user}>
                <MyBooks user={user} setUser={setCurrentUser} />
              </ProtectedRoute>
            } />
            <Route path="/reading-list" element={
              <ProtectedRoute user={user}>
                <ReadingList user={user} setUser={setCurrentUser} />
              </ProtectedRoute>
            } />
            <Route path="/books/:id" element={<BookDetail user={user} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  const { user, loading, setCurrentUser } = useCurrentUser();

  return (
    <Router>
      <AppContent user={user} loading={loading} setCurrentUser={setCurrentUser} />
    </Router>
  );
}

export default App;
