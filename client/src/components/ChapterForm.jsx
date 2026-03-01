import { useState } from 'react';

function ChapterForm({ chapter, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: chapter?.title || '',
    content: chapter?.content || '',
    order: chapter?.order || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Il titolo è obbligatorio');
      return;
    }
    onSave(formData);
  };

  const handleChange = (e) => {
    const value = e.target.name === 'order' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{chapter ? '✏️ Modifica Capitolo' : '📝 Nuovo Capitolo'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titolo del Capitolo *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              placeholder="Es: L'inizio dell'avventura"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Contenuto *</label>
            <textarea
              id="content"
              name="content"
              className="form-control"
              value={formData.content}
              onChange={handleChange}
              placeholder="Scrivi il contenuto del capitolo..."
              rows="15"
              style={{ minHeight: '300px' }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="order">Ordine (opzionale)</label>
            <input
              type="number"
              id="order"
              name="order"
              className="form-control"
              value={formData.order}
              onChange={handleChange}
              placeholder="0"
              min="0"
              style={{ width: '120px' }}
            />
            <small style={{ display: 'block', marginTop: '6px', color: 'var(--color-foreground-muted)', fontSize: '0.8rem' }}>
              Lascia 0 per aggiungere alla fine automaticamente
            </small>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary">
              {chapter ? 'Salva Modifiche' : 'Crea Capitolo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChapterForm;
