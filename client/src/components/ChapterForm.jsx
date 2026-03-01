import { useState, useRef } from 'react';
import { uploadAPI } from '../api';

function ChapterForm({ chapter, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: chapter?.title || '',
    content: chapter?.content || '',
    order: chapter?.order || 0,
  });
  const [inputMode, setInputMode] = useState('write'); // 'write' or 'pdf'
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pdfInfo, setPdfInfo] = useState(null);
  const fileInputRef = useRef(null);

  const handlePdfSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Il file è troppo grande. Massimo 20MB.');
      return;
    }

    setPdfFile(file);
    setUploading(true);
    setPdfInfo(null);

    try {
      const response = await uploadAPI.uploadPdf(file);
      const { text, pages } = response.data;

      setFormData(prev => ({
        ...prev,
        content: text,
        title: prev.title || file.name.replace('.pdf', '')
      }));
      setPdfInfo({ pages, fileName: file.name });
    } catch (error) {
      const msg = error.response?.data?.error || 'Errore nel caricamento del PDF';
      alert(msg);
      setPdfFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfInfo(null);
    setFormData(prev => ({ ...prev, content: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Il titolo è obbligatorio');
      return;
    }
    if (!formData.content.trim()) {
      alert('Il contenuto è obbligatorio');
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
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
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

          {/* Input Mode Tabs */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => setInputMode('write')}
              style={{
                padding: '10px 20px',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                background: inputMode === 'write' ? 'var(--color-primary)' : 'var(--color-background-200)',
                color: inputMode === 'write' ? 'white' : 'var(--color-foreground-muted)',
                fontWeight: inputMode === 'write' ? '600' : '400',
                transition: 'var(--transition)',
                fontSize: '0.9rem'
              }}
            >
              ✍️ Scrivi
            </button>
            <button
              type="button"
              onClick={() => setInputMode('pdf')}
              style={{
                padding: '10px 20px',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                background: inputMode === 'pdf' ? 'var(--color-primary)' : 'var(--color-background-200)',
                color: inputMode === 'pdf' ? 'white' : 'var(--color-foreground-muted)',
                fontWeight: inputMode === 'pdf' ? '600' : '400',
                transition: 'var(--transition)',
                fontSize: '0.9rem'
              }}
            >
              📄 Carica PDF
            </button>
          </div>

          {inputMode === 'pdf' && (
            <div className="form-group">
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--color-background-300)',
                  borderRadius: 'var(--radius-md)',
                  padding: '32px 20px',
                  textAlign: 'center',
                  cursor: uploading ? 'wait' : 'pointer',
                  background: pdfInfo ? 'var(--color-background-100)' : 'transparent',
                  transition: 'var(--transition)'
                }}
              >
                {uploading ? (
                  <div>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
                    <div style={{ color: 'var(--color-foreground-muted)' }}>Elaborazione PDF in corso...</div>
                  </div>
                ) : pdfInfo ? (
                  <div>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{pdfInfo.fileName}</div>
                    <div style={{ color: 'var(--color-foreground-muted)', fontSize: '0.85rem' }}>
                      {pdfInfo.pages} pagine · Testo estratto con successo
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleRemovePdf(); }}
                      style={{ marginTop: '12px', color: 'var(--color-accent)' }}
                    >
                      🗑️ Rimuovi e ricarica
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📄</div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Clicca per caricare un PDF</div>
                    <div style={{ color: 'var(--color-foreground-muted)', fontSize: '0.85rem' }}>
                      Il testo verrà estratto automaticamente · Max 20MB
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="content">
              Contenuto *
              {inputMode === 'pdf' && pdfInfo && (
                <span style={{ fontWeight: '400', fontSize: '0.8rem', color: 'var(--color-foreground-muted)', marginLeft: '8px' }}>
                  (puoi modificare il testo estratto)
                </span>
              )}
            </label>
            <textarea
              id="content"
              name="content"
              className="form-control"
              value={formData.content}
              onChange={handleChange}
              placeholder={inputMode === 'pdf' ? 'Il testo del PDF apparirà qui...' : 'Scrivi il contenuto del capitolo...'}
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
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={uploading}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? '⏳ Elaborazione...' : (chapter ? 'Salva Modifiche' : 'Crea Capitolo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChapterForm;
