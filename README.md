# Tennis Ranking Frontend 🎾

React + TypeScript + Vite + MUI frontend for the Tennis Ranking system.

## Quick Start (with Docker)

O jeito mais fácil é usar o docker-compose no backend:

```bash
cd ../tennis-ranking-api
docker-compose up
```

Isso sobe PostgreSQL + API + Frontend automaticamente.

## Desenvolvimento Local

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:
- `VITE_API_URL` - URL da API (default: http://localhost:3000)
- `VITE_GOOGLE_CLIENT_ID` - Client ID do Google OAuth

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar em dev mode

```bash
npm run dev
```

O app estará em http://localhost:5173

## Scripts

- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Lint code

## Estrutura

```
src/
├── api/
│   └── client.ts       # API client
├── components/
│   ├── Friends.tsx     # Friends management
│   ├── Layout.tsx      # App layout
│   ├── Leaderboard.tsx # Player rankings
│   ├── MatchForm.tsx   # Log new match
│   ├── MatchHistory.tsx
│   ├── PendingMatches.tsx
│   └── PlayerProfile.tsx
├── contexts/
│   ├── AuthContext.tsx # Google OAuth + JWT
│   └── DataContext.tsx # Data fetching
├── pages/
│   └── Home.tsx
├── types/
│   └── index.ts
└── utils/
    ├── elo.ts          # ELO calculations
    └── tennis.ts       # Score validation
```

## Features

- 🔐 Google OAuth login
- 👥 Friends system (only play with friends)
- 🎯 Match logging with set scores
- ✅ Match confirmation (opponent must approve)
- 📊 ELO ranking system
- 📱 Mobile-friendly (PWA-ready)

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast builds
- **MUI (Material-UI)** components
- **React Router** for navigation
- **@react-oauth/google** for auth
