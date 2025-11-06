# Fluito Frontend

Modern React + TypeScript frontend for the Fluito dating app, built with Vite.

## Features

- ⚡️ Vite for fast development and builds
- ⚛️ React 19 with TypeScript
- 🎨 Glassmorphism UI design
- 🎨 Dynamic theming (Blue for male, Pink for female)
- 📱 Mobile-responsive design
- 🔐 Protected routes with authentication
- 🚀 React Router for navigation

## Getting Started

### Prerequisites

- Node.js 20.19.0 or higher (or 22.12.0+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**Note:** Make sure the backend API is running on `http://localhost:4000` (configured via Vite proxy).

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/      # Reusable components
│   ├── Background.tsx
│   ├── Navigation.tsx
│   └── ProtectedRoute.tsx
├── context/         # React Context providers
│   └── AuthContext.tsx
├── pages/           # Page components
│   ├── AuthPage.tsx
│   ├── DiscoverPage.tsx
│   ├── MatchesPage.tsx
│   ├── MessagesPage.tsx
│   └── ProfilePage.tsx
├── services/        # API service layer
│   └── api.ts
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## API Configuration

The frontend is configured to proxy API requests to `http://localhost:4000/api` via Vite's proxy. This is configured in `vite.config.ts`.

## Features

- **Authentication**: Login and registration with JWT tokens
- **Discover**: Swipe through potential matches
- **Matches**: View your matched users
- **Messages**: Chat with your matches
- **Profile**: Update your profile and preferences

## Theming

The app automatically switches themes based on user gender:
- **Blue theme**: Male users
- **Pink theme**: Female users

Themes are applied via CSS variables and can be customized in `src/index.css`.
