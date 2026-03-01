import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

function Auth({ setUser }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('userId', response.data._id);
        setUser(response.data);
        navigate('/');
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setError('Le password non coincidono');
          setLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          setError('La password deve avere almeno 6 caratteri');
          setLoading(false);
          return;
        }

        const response = await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
        localStorage.setItem('userId', response.data._id);
        setUser(response.data);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Si è verificato un errore');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h1>{isLogin ? 'Bentornato!' : 'Unisciti a BookList'}</h1>
          <p>{isLogin ? 'Accedi al tuo account' : 'Crea il tuo account gratuito'}</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name">Nome completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Il tuo nome"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Scegli un username"
                  required
                  minLength={3}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="La tua email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder={isLogin ? 'La tua password' : 'Minimo 6 caratteri'}
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Conferma Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ripeti la password"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                {isLogin ? 'Accesso...' : 'Registrazione...'}
              </>
            ) : (
              isLogin ? 'Accedi' : 'Registrati'
            )}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <p>
              Non hai un account?{' '}
              <button type="button" onClick={switchMode} className="auth-link">
                Registrati
              </button>
            </p>
          ) : (
            <p>
              Hai già un account?{' '}
              <button type="button" onClick={switchMode} className="auth-link">
                Accedi
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
