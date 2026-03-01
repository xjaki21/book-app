import { Link } from 'react-router-dom';

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

function BookCard({ book, showActions = false, onEdit, onDelete }) {
  const authorName = book.author?.name || book.author || 'Sconosciuto';
  
  return (
    <Link to={`/books/${book._id}`} className="book-card" style={{ textDecoration: 'none' }}>
      <div className="book-card-cover">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} />
        ) : (
          <div 
            className="book-card-cover-placeholder"
            style={{ 
              background: `linear-gradient(135deg, ${GENRE_COLORS[book.genre] || GENRE_COLORS.other} 0%, ${GENRE_COLORS[book.genre] || GENRE_COLORS.other}99 100%)`
            }}
          >
            📖
          </div>
        )}
        <div className="book-card-overlay">
          <div className="book-card-genres">
            {book.genre && (
              <span className="genre-tag" style={{ background: GENRE_COLORS[book.genre] || GENRE_COLORS.other }}>
                {book.genre}
              </span>
            )}
            {book.status === 'ongoing' && (
              <span className="genre-tag" style={{ background: '#27ae60' }}>In corso</span>
            )}
            {book.status === 'completed' && (
              <span className="genre-tag" style={{ background: '#3498db' }}>Completato</span>
            )}
          </div>
        </div>
      </div>
      <div className="book-card-content">
        <h3 className="book-card-title">{book.title}</h3>
        <div className="book-card-meta">{authorName}</div>
        <div className="book-card-stats">
          <span>📑 {book.chaptersCount || 0}</span>
          <span>👁 {book.views || 0}</span>
          <span>❤️ {book.likes || 0}</span>
        </div>
      </div>
    </Link>
  );
}

export default BookCard;
