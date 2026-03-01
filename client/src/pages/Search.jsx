import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { booksAPI } from '../api';
import BookCard from '../components/BookCard';

const GENRES = [
  { value: '', label: 'Tutti' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'romance', label: 'Romance' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'horror', label: 'Horror' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'drama', label: 'Drama' },
  { value: 'comedy', label: 'Comedy' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Recenti' },
  { value: 'popular', label: 'Popolari' },
  { value: 'likes', label: 'Più amati' },
  { value: 'title', label: 'Alfabetico' },
];

function Search({ user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  useEffect(() => {
    loadBooks();
  }, [searchParams]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchParams.get('q') || undefined,
        genre: searchParams.get('genre') || undefined,
        sort: searchParams.get('sort') || undefined,
      };
      const response = await booksAPI.getAll(params);
      setBooks(response.data.books || response.data);
    } catch (error) {
      console.error('Errore nella ricerca:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (genre) params.set('genre', genre);
    if (sort) params.set('sort', sort);
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
    
    if (key === 'genre') setGenre(value);
    if (key === 'sort') setSort(value);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Cerca Libri</h1>
        <p>Trova il tuo prossimo libro preferito</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Cerca per titolo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">
            🔍 Cerca
          </button>
        </div>
      </form>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--color-foreground-muted)' }}>
            Genere
          </label>
          <div className="filter-bar">
            {GENRES.map(g => (
              <button
                key={g.value}
                className={`filter-btn ${genre === g.value ? 'active' : ''}`}
                onClick={() => handleFilterChange('genre', g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--color-foreground-muted)' }}>
            Ordina per
          </label>
          <div className="filter-bar">
            {SORT_OPTIONS.map(s => (
              <button
                key={s.value}
                className={`filter-btn ${sort === s.value ? 'active' : ''}`}
                onClick={() => handleFilterChange('sort', s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Nessun risultato</h3>
          <p>Prova a modificare i filtri di ricerca</p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: '20px', color: 'var(--color-foreground-muted)' }}>
            {books.length} {books.length === 1 ? 'risultato' : 'risultati'} trovati
          </p>
          <div className="cards-grid cards-grid-5">
            {books.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Search;
