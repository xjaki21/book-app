import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { readingListAPI, usersAPI } from '../api';
import BookCard from '../components/BookCard';

const STATUS_CONFIG = {
  'planning': { label: 'Da Leggere', color: 'var(--color-background-300)', icon: '📋' },
  'reading': { label: 'In Lettura', color: '#2563eb', icon: '📖' },
  'completed': { label: 'Completato', color: '#16a34a', icon: '✅' },
  'paused': { label: 'In Pausa', color: '#d97706', icon: '⏸️' },
  'dropped': { label: 'Abbandonato', color: '#dc2626', icon: '❌' }
};

function ReadingList({ user, setUser }) {
  const [readingList, setReadingList] = useState([]);
  const [stats, setStats] = useState({ total: 0, planning: 0, reading: 0, completed: 0, paused: 0, dropped: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, filter]);

  const loadData = async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        readingListAPI.getByUserId(user._id, filter),
        readingListAPI.getStats(user._id)
      ]);
      setReadingList(listRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Errore nel caricamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (entryId, newStatus) => {
    try {
      await readingListAPI.update(entryId, { status: newStatus });
      await loadData();
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
    }
  };

  const handleRemove = async (entryId) => {
    if (!window.confirm('Rimuovere questo libro dalla lista?')) return;
    
    try {
      await readingListAPI.remove(entryId);
      await loadData();
    } catch (error) {
      console.error('Errore nella rimozione:', error);
    }
  };

  const handleScoreChange = async (entryId, score) => {
    try {
      await readingListAPI.update(entryId, { score: parseInt(score) });
      await loadData();
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await usersAPI.create({
        username: 'user_' + Date.now(),
        name: 'Nuovo Utente'
      });
      setUser(response.data);
    } catch (error) {
      console.error('Errore nella creazione utente:', error);
    }
  };

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👤</div>
        <h3>Accedi per iniziare</h3>
        <p>Crea un account per salvare i libri nella tua lista di lettura</p>
        <button className="btn btn-primary" onClick={handleCreateUser}>
          Crea Account Demo
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>La Mia Lista</h1>
        <p>Tieni traccia dei tuoi progressi di lettura</p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '12px',
        marginBottom: '32px'
      }}>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? '' : key)}
            style={{ 
              background: filter === key ? config.color : 'var(--color-background-100)', 
              padding: '16px', 
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{config.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: filter === key ? 'white' : 'var(--color-foreground)' }}>
              {stats[key] || 0}
            </div>
            <div style={{ fontSize: '0.7rem', color: filter === key ? 'rgba(255,255,255,0.8)' : 'var(--color-foreground-muted)', textTransform: 'uppercase' }}>
              {config.label}
            </div>
          </button>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="filter-bar" style={{ marginBottom: '24px' }}>
        <button 
          className={`filter-btn ${filter === '' ? 'active' : ''}`}
          onClick={() => setFilter('')}
        >
          Tutti ({stats.total})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <button
            key={key}
            className={`filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {config.icon} {config.label} ({stats[key] || 0})
          </button>
        ))}
      </div>

      {readingList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>Lista vuota</h3>
          <p>Esplora la community e aggiungi libri alla tua lista!</p>
          <Link to="/">
            <button className="btn btn-primary">Esplora</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {readingList.map((entry) => (
            <div 
              key={entry._id} 
              style={{ 
                background: 'var(--color-background-100)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '80px 1fr auto',
                gap: '20px',
                alignItems: 'center'
              }}
            >
              <Link to={`/books/${entry.book._id}`}>
                <div style={{ 
                  width: '80px', 
                  height: '112px', 
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #2196f3 100%)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  📖
                </div>
              </Link>
              
              <div>
                <Link to={`/books/${entry.book._id}`}>
                  <h3 style={{ marginBottom: '4px', color: 'var(--color-foreground)' }}>{entry.book.title}</h3>
                </Link>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)', marginBottom: '12px' }}>
                  {entry.book.author?.name || 'Autore sconosciuto'}
                </div>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={entry.status}
                    onChange={(e) => handleStatusChange(entry._id, e.target.value)}
                    className="form-control"
                    style={{ width: 'auto', padding: '8px 12px' }}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-foreground-muted)' }}>Voto:</span>
                    <select
                      value={entry.score || ''}
                      onChange={(e) => handleScoreChange(entry._id, e.target.value)}
                      className="form-control"
                      style={{ width: 'auto', padding: '8px 12px' }}
                    >
                      <option value="">-</option>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <span className={`status-badge status-${entry.status}`}>
                  {STATUS_CONFIG[entry.status]?.icon} {STATUS_CONFIG[entry.status]?.label}
                </span>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleRemove(entry._id)}
                  style={{ color: 'var(--color-accent)' }}
                >
                  🗑️ Rimuovi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReadingList;
