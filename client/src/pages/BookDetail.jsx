import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { booksAPI, chaptersAPI, readingListAPI } from '../api';
import ChapterForm from '../components/ChapterForm';

const GENRE_COLORS = {
  fantasy: '#9b59b6',
  romance: '#e74c3c',
  thriller: '#34495e',
  horror: '#2c3e50',
  'sci-fi': '#3498db',
  mystery: '#1abc9c',
  adventure: '#27ae60',
  drama: '#e67e22',
  comedy: '#f1c40f',
  other: '#95a5a6'
};

const STATUS_CONFIG = {
  'planning': { label: 'Da Leggere', color: 'var(--color-background-300)' },
  'reading': { label: 'In Lettura', color: '#2563eb' },
  'completed': { label: 'Completato', color: '#16a34a' },
  'paused': { label: 'In Pausa', color: '#d97706' },
  'dropped': { label: 'Abbandonato', color: '#dc2626' }
};

function BookDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [readingEntry, setReadingEntry] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadBook();
    if (user) {
      checkReadingList();
    }
  }, [id, user]);

  const loadBook = async () => {
    try {
      const response = await booksAPI.getById(id);
      setBook(response.data);
    } catch (error) {
      console.error('Errore:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkReadingList = async () => {
    try {
      const response = await readingListAPI.check(user._id, id);
      setReadingEntry(response.data.entry);
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const handleAddToList = async (status = 'planning') => {
    if (!user) {
      alert('Devi essere loggato per aggiungere libri alla lista');
      return;
    }
    
    try {
      await readingListAPI.add(user._id, id, status);
      await checkReadingList();
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!readingEntry) return;
    
    try {
      await readingListAPI.update(readingEntry._id, { status });
      await checkReadingList();
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const handleLike = async () => {
    try {
      await booksAPI.like(id);
      setBook(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
      setLiked(true);
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const handleSaveChapter = async (chapterData) => {
    try {
      if (editingChapter) {
        await chaptersAPI.update(editingChapter._id, chapterData);
      } else {
        await chaptersAPI.create(id, chapterData);
      }
      await loadBook();
      setShowChapterForm(false);
      setEditingChapter(null);
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Eliminare questo capitolo?')) return;
    
    try {
      await chaptersAPI.delete(chapterId);
      await loadBook();
      if (selectedChapter?._id === chapterId) {
        setSelectedChapter(null);
      }
    } catch (error) {
      console.error('Errore:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!book) return null;

  const isMyBook = user && book.authorId?._id === user._id;
  const authorName = book.author?.name || book.authorId?.name || 'Sconosciuto';

  // Reader view
  if (selectedChapter) {
    return (
      <div className="reader">
        <div className="reader-header">
          <button 
            className="btn btn-ghost"
            onClick={() => setSelectedChapter(null)}
            style={{ marginBottom: '16px' }}
          >
            ← Torna ai capitoli
          </button>
          <h1>{selectedChapter.title}</h1>
          <p style={{ color: 'var(--color-foreground-muted)' }}>{book.title}</p>
        </div>
        <div className="reader-content">
          {selectedChapter.content}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--color-background-300)' }}>
          {book.chapters && book.chapters.findIndex(c => c._id === selectedChapter._id) > 0 && (
            <button 
              className="btn btn-secondary"
              onClick={() => {
                const idx = book.chapters.findIndex(c => c._id === selectedChapter._id);
                setSelectedChapter(book.chapters[idx - 1]);
              }}
            >
              ← Capitolo precedente
            </button>
          )}
          {book.chapters && book.chapters.findIndex(c => c._id === selectedChapter._id) < book.chapters.length - 1 && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                const idx = book.chapters.findIndex(c => c._id === selectedChapter._id);
                setSelectedChapter(book.chapters[idx + 1]);
              }}
              style={{ marginLeft: 'auto' }}
            >
              Capitolo successivo →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '20px', color: 'var(--color-foreground-muted)' }}>
        ← Torna alla home
      </Link>

      {/* Book Header */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '230px 1fr',
        gap: '40px',
        marginBottom: '40px',
        background: 'var(--color-background-100)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
      }}>
        {/* Cover */}
        <div>
          <div style={{ 
            width: '100%',
            paddingTop: '143%',
            position: 'relative',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${GENRE_COLORS[book.genre] || GENRE_COLORS.other} 0%, ${GENRE_COLORS[book.genre] || GENRE_COLORS.other}99 100%)`
          }}>
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '5rem',
              color: 'rgba(255,255,255,0.5)'
            }}>
              📖
            </div>
          </div>
          
          {/* Actions */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {readingEntry ? (
              <select
                value={readingEntry.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="form-control"
                style={{ textAlign: 'center' }}
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            ) : (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => handleAddToList('planning')}
              >
                ➕ Aggiungi alla Lista
              </button>
            )}
            
            <button 
              className={`btn ${liked ? 'btn-danger' : 'btn-secondary'}`}
              style={{ width: '100%' }}
              onClick={handleLike}
              disabled={liked}
            >
              ❤️ {book.likes || 0} Mi piace
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {book.genre && (
              <span style={{ 
                background: GENRE_COLORS[book.genre] || GENRE_COLORS.other,
                color: 'white',
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                textTransform: 'capitalize'
              }}>
                {book.genre}
              </span>
            )}
            {book.status && (
              <span style={{ 
                background: book.status === 'completed' ? '#16a34a' : '#d97706',
                color: 'white',
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                textTransform: 'capitalize'
              }}>
                {book.status === 'completed' ? 'Completato' : book.status === 'ongoing' ? 'In corso' : 'In pausa'}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{book.title}</h1>
          <p style={{ color: 'var(--color-foreground-muted)', marginBottom: '20px' }}>di {authorName}</p>

          {book.description && (
            <p style={{ lineHeight: '1.8', color: 'var(--color-foreground-alt)', marginBottom: '24px' }}>
              {book.description}
            </p>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                {book.chapters?.length || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', textTransform: 'uppercase' }}>
                Capitoli
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-foreground)' }}>
                {book.views || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', textTransform: 'uppercase' }}>
                Visualizzazioni
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-accent)' }}>
                {book.likes || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)', textTransform: 'uppercase' }}>
                Mi Piace
              </div>
            </div>
          </div>

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {book.tags.map((tag, i) => (
                <span key={i} style={{ 
                  background: 'var(--color-background-200)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--color-foreground-muted)'
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chapters Section */}
      <div style={{ 
        background: 'var(--color-background-100)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Capitoli</h2>
          {isMyBook && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => { setEditingChapter(null); setShowChapterForm(true); }}
            >
              ➕ Nuovo Capitolo
            </button>
          )}
        </div>

        {showChapterForm && (
          <ChapterForm
            chapter={editingChapter}
            onSave={handleSaveChapter}
            onCancel={() => { setShowChapterForm(false); setEditingChapter(null); }}
          />
        )}

        {!book.chapters || book.chapters.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px' }}>
            <div className="empty-state-icon">📑</div>
            <h3>Nessun capitolo</h3>
            {isMyBook && <p>Aggiungi il primo capitolo al tuo libro!</p>}
          </div>
        ) : (
          <div className="chapter-list">
            {book.chapters.map((chapter, index) => (
              <div 
                key={chapter._id} 
                className="chapter-item"
                onClick={() => setSelectedChapter(chapter)}
              >
                <div className="chapter-item-info">
                  <div className="chapter-item-title">
                    Capitolo {index + 1}: {chapter.title}
                  </div>
                  <div className="chapter-item-preview">
                    {chapter.content.substring(0, 100)}...
                  </div>
                </div>
                <div className="chapter-item-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedChapter(chapter)}>
                    📖 Leggi
                  </button>
                  {isMyBook && (
                    <>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setEditingChapter(chapter); setShowChapterForm(true); }}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteChapter(chapter._id)}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetail;
