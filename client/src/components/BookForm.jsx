import { useState } from 'react';

const GENRES = [
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'romance', label: 'Romance' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'horror', label: 'Horror' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'drama', label: 'Drama' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'other', label: 'Altro' },
];

function BookForm({ book, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    description: book?.description || '',
    genre: book?.genre || 'other',
    status: book?.status || 'ongoing',
    tags: book?.tags?.join(', ') || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Il titolo è obbligatorio');
      return;
    }
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{book ? '✏️ Modifica Libro' : '📚 Nuovo Libro'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titolo *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              placeholder="Il titolo del tuo libro"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrizione</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              placeholder="Una breve descrizione del tuo libro..."
              rows="4"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="genre">Genere</label>
              <select
                id="genre"
                name="genre"
                className="form-control"
                value={formData.genre}
                onChange={handleChange}
              >
                {GENRES.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Stato</label>
              <select
                id="status"
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ongoing">In corso</option>
                <option value="completed">Completato</option>
                <option value="hiatus">In pausa</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tag (separati da virgola)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              className="form-control"
              value={formData.tags}
              onChange={handleChange}
              placeholder="es: avventura, magia, amicizia"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary">
              {book ? 'Salva Modifiche' : 'Crea Libro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookForm;
