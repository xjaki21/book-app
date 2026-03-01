import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI, usersAPI } from '../api';
import BookCard from '../components/BookCard';

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

function Community({ user, setUser }) {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trendingRes, popularRes, recentRes] = await Promise.all([
        booksAPI.getTrending(),
        booksAPI.getPopular(),
        booksAPI.getRecent()
      ]);
      setTrending(trendingRes.data);
      setPopular(popularRes.data);
      setRecent(recentRes.data);

      // Auto-login with demo user if no user
      if (!user && trendingRes.data.length > 0) {
        const authorId = trendingRes.data[0].authorId?._id || trendingRes.data[0].author?._id;
        if (authorId) {
          const userRes = await usersAPI.getById(authorId);
          setUser(userRes.data);
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const hasContent = trending.length > 0 || popular.length > 0 || recent.length > 0;

  return (
    <div>
      {!hasContent ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>Benvenuto su BookList!</h3>
          <p>Non ci sono ancora libri nella community. Sii il primo a pubblicare!</p>
          <Link to="/my-books">
            <button className="btn btn-primary">Pubblica il tuo primo libro</button>
          </Link>
        </div>
      ) : (
        <>
          {/* Trending Section */}
          {trending.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">🔥 Trending Now</h2>
                <Link to="/search?sort=trending" className="section-link">View All</Link>
              </div>
              <div className="cards-scroll">
                {trending.map(book => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </section>
          )}

          <hr className="section-divider" />

          {/* Popular Section */}
          {popular.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">⭐ All Time Popular</h2>
                <Link to="/search?sort=popular" className="section-link">View All</Link>
              </div>
              <div className="cards-scroll">
                {popular.map(book => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </section>
          )}

          <hr className="section-divider" />

          {/* Recently Updated */}
          {recent.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="section-title">📖 Recently Updated</h2>
                <Link to="/search?sort=recent" className="section-link">View All</Link>
              </div>
              <div className="cards-grid cards-grid-5">
                {recent.map(book => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default Community;
