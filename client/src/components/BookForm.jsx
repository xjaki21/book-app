import { useState, useRef } from 'react';
import { uploadAPI } from '../api';

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
    coverImage: book?.coverImage || '',
  });
  const [coverPreview, setCoverPreview] = useState(book?.coverImage || '');
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Il file è troppo grande. Massimo 5MB.');
      return;
    }

    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview('');
    setFormData({ ...formData, coverImage: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Il titolo è obbligatorio');
      return;
    }

    let coverImage = formData.coverImage;

    // Upload cover if a new file was selected
    if (coverFile) {
      try {
        setUploading(true);
        const response = await uploadAPI.uploadCover(coverFile);
        coverImage = response.data.url;
      } catch (error) {
        console.error('Errore upload copertina:', error);
        alert('Errore nel caricamento della copertina');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    onSave({
      ...formData,
      coverImage,
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
          {/* Cover Image Upload */}
          <div className="form-group">
            <label>Copertina</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '120px',
                  height: '170px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px dashed var(--color-background-300)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: coverPreview ? 'none' : 'var(--color-background-100)',
                  position: 'relative',
                }}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Anteprima copertina"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--color-foreground-muted)', padding: '8px' }}>
                    <div style={{ fontSize: '2rem' }}>📷</div>
                    <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>Clicca per caricare</div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleCoverChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Scegli immagine
                </button>
                {coverPreview && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleRemoveCover}
                    style={{ color: 'var(--color-accent)' }}
                  >
                    🗑️ Rimuovi
                  </button>
                )}
                <span style={{ fontSize: '0.75rem', color: 'var(--color-foreground-muted)' }}>
                  JPEG, PNG, WebP, GIF · Max 5MB
                </span>
              </div>
            </div>
          </div>

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

          <div className="form-row-2col">
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
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={uploading}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? '⏳ Caricamento...' : (book ? 'Salva Modifiche' : 'Crea Libro')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookForm;
