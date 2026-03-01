# Book Community App

Un'applicazione web per condividere e gestire libri nella community.

## Funzionalità

- **Pubblica i tuoi libri**: Aggiungi i tuoi libri con copertine personalizzate e condividili con la community
- **Lista lettura**: Tieni traccia dei tuoi progressi (Da Leggere, In Lettura, Completato, In Pausa, Abbandonato)
- **Community**: Esplora i libri pubblicati da altri utenti
- **Gestione capitoli**: Organizza i tuoi libri in capitoli, scrivi direttamente o carica un PDF
- **Copertine**: Carica immagini di copertina per i tuoi libri (JPEG, PNG, WebP, GIF — max 5MB), salvate su **Cloudinary**
- **Import PDF**: Carica un PDF e il testo viene estratto automaticamente come capitolo


## Struttura del Progetto

```
book-app/
├── client/          # Frontend React + Vite
├── server/          # Backend Node.js + Express
├── docker-compose.yml
└── README.md
```

## Prerequisiti

- **Node.js** (v18+)
- **MongoDB** (locale o via Docker)
- **Account Cloudinary** (gratuito — [registrati qui](https://cloudinary.com/users/register/free))

## Installazione

1. Installa tutte le dipendenze:
```bash
npm run install-all
```

2. Avvia MongoDB con Docker:
```bash
docker compose up -d
```
Oppure, se hai MongoDB installato localmente:
```bash
sudo systemctl start mongodb
```

3. Crea il file `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/book-app
PORT=3000

# Cloudinary (trovi le credenziali nella dashboard di Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. (Opzionale) Popola il database con dati di esempio:
```bash
cd server
node seed.js
```
Credenziali utente demo: `demo@example.com` / `demo123`

5. Avvia il progetto in modalità sviluppo:
```bash
npm run dev
```

Il frontend sarà disponibile su `http://localhost:5173`
Il backend sarà disponibile su `http://localhost:3000`

## Tecnologie Utilizzate

### Frontend
- React 18
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- Multer (upload file)
- Cloudinary + multer-storage-cloudinary (storage immagini)
- pdf-parse (estrazione testo da PDF)
- CORS
