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

---

# Book Community App (English)

A web application to share and manage books within the community.

## Features

- **Publish your books**: Add your books with custom covers and share them with the community
- **Reading list**: Track your progress (To Read, Reading, Completed, On Hold, Dropped)
- **Community**: Explore books published by other users
- **Chapter management**: Organize your books into chapters, write directly or upload a PDF
- **Covers**: Upload cover images for your books (JPEG, PNG, WebP, GIF — max 5MB), stored on **Cloudinary**
- **PDF Import**: Upload a PDF and the text is automatically extracted as a chapter

## Project Structure

```
book-app/
├── client/          # Frontend React + Vite
├── server/          # Backend Node.js + Express
├── docker-compose.yml
└── README.md
```

## Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or via Docker)
- **Cloudinary account** (free — [sign up here](https://cloudinary.com/users/register/free))

## Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Start MongoDB with Docker:
```bash
docker compose up -d
```
Or, if you have MongoDB installed locally:
```bash
sudo systemctl start mongodb
```

3. Create the `server/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/book-app
PORT=3000

# Cloudinary (find your credentials in the Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. (Optional) Seed the database with sample data:
```bash
cd server
node seed.js
```
Demo user credentials: `demo@example.com` / `demo123`

5. Start the project in development mode:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend will be available at `http://localhost:3000`

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- Multer (file upload)
- Cloudinary + multer-storage-cloudinary (image storage)
- pdf-parse (PDF text extraction)
- CORS
