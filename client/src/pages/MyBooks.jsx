import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI, usersAPI } from '../api';
import BookCard from '../components/BookCard';
import BookForm from '../components/BookForm';

function MyBooks({ user, setUser }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    if (user) {
      loadBooks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadBooks = async () => {
    try {
      const response = await usersAPI.getBooks(user._id);
      setBooks(response.data);
    } catch (error) {
      console.error('Errore nel caricamento dei libri:', error);
    } finally {
      setLoading(false);
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

  const handleSave = async (bookData) => {
    try {
      if (editingBook) {
        await booksAPI.update(editingBook._id, bookData);
      } else {
        await booksAPI.create({ ...bookData, authorId: user._id });
      }
      await loadBooks();
      setShowForm(false);
      setEditingBook(null);
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      alert('Errore nel salvataggio del libro');
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo libro?')) return;
    
    try {
      await booksAPI.delete(bookId);
      await loadBooks();
    } catch (error) {
      console.error('Errore nell\'eliminazione:', error);
    }
  };

  const handleEdit = (e, book) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBook(book);
    setShowForm(true);
  };

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👤</div>
        <h3>Accedi per iniziare</h3>
        <p>Crea un account per pubblicare i tuoi libri e condividerli con la community</p>
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>I Miei Libri</h1>
          <p>Gestisci i tuoi libri e capitoli</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => { setEditingBook(null); setShowForm(true); }}
        >
          ➕ Nuovo Libro
        </button>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ 
          background: 'var(--color-background-100)', 
          padding: '20px', 
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)' }}>
            {books.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-foreground-muted)', textTransform: 'uppercase' }}>
            Libri Pubblicati
          </div>
        </div>
        <div style={{ 
          background: 'var(--color-background-100)', 
          padding: '20px', 
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-success)' }}>
            {books.reduce((sum, b) => sum + (b.chaptersCount || 0), 0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-foreground-muted)', textTransform: 'uppercase' }}>
            Capitoli Totali
          </div>
        </div>
        <div style={{ 
          background: 'var(--color-background-100)', 
          padding: '20px', 
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-accent)' }}>
            {books.reduce((sum, b) => sum + (b.likes || 0), 0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-foreground-muted)', textTransform: 'uppercase' }}>
            Totale Like
          </div>
        </div>
      </div>

      {showForm && (
        <BookForm 
          book={editingBook}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingBook(null); }}
        />
      )}

      {books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>Nessun libro pubblicato</h3>
          <p>Inizia a scrivere e condividere i tuoi libri con la community!</p>
        </div>
      ) : (
        <div className="cards-grid cards-grid-4">
          {books.map((book) => (
            <div key={book._id} style={{ position: 'relative' }}>
              <BookCard book={book} />
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginTop: '8px',
                justifyContent: 'center'
              }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => handleEdit(e, book)}
                >
                  ✏️ Modifica
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={(e) => { e.preventDefault(); handleDelete(book._id); }}
                >
                  🗑️ Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBooks;
