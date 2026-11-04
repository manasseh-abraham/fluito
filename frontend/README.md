# Fluito Frontend

Modern React + TypeScript frontend for the Fluito dating app, built with Vite. This is the fastest path to put Fluito in users’ hands (same-origin SPA served by the Bun API after `frontend/dist` is deployed).

## Features

- ⚡️ Vite for fast development and builds
- ⚛️ React 19 with TypeScript
- 🎨 Glassmorphism UI design
- 🎨 Dynamic theming (Blue for male, Pink for female)
- 📱 Mobile-responsive design
- 🔐 Email/password + Google Sign-In, with an onboarding gate when DOB/gender are missing
- 🚫 Block, report, and account deletion
- 📜 Privacy / Terms links to same-origin `/privacy` and `/terms`
- 🚀 React Router for navigation

## Getting Started

### Prerequisites

- Node.js 20.19.0 or higher (or 22.12.0+)
- npm or yarn

### Installation

```bash
npm ci
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**Note:** Make sure the backend API is running on `http://localhost:4000` (configured via Vite proxy for `/api`, `/privacy`, and `/terms`).

### Build

Build for production:

```bash
npm ci
npm run build
```

The built files will be in the `dist` directory. The Bun host (`src/index.ts`) serves `./frontend/dist` as a SPA after API and legal routes. Same-origin `/api` is correct in production.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/      # Reusable components
│   ├── Background.tsx
│   ├── GoogleSignInButton.tsx
│   ├── LegalLinks.tsx
│   ├── Navigation.tsx
│   ├── ProtectedRoute.tsx
│   └── SafetyActions.tsx
├── context/         # React Context providers
│   └── AuthContext.tsx
├── pages/           # Page components
│   ├── AuthPage.tsx
│   ├── DiscoverPage.tsx
│   ├── MatchesPage.tsx
│   ├── MessagesPage.tsx
│   ├── OnboardingPage.tsx
│   └── ProfilePage.tsx
├── services/        # API service layer
│   └── api.ts
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## API Configuration

The frontend is configured to proxy API requests to `http://localhost:4000/api` via Vite's proxy. This is configured in `vite.config.ts`. When the SPA is served from the Bun host (https://api.fluito.veritas.org.in/), `/api` is same-origin.

## Google Sign-In (production)

The web client ID is public (not a secret):

`619885353175-l00am55pa3j7rc1a5h3pcmqhhhldh3um.apps.googleusercontent.com`

GIS (`https://accounts.google.com/gsi/client`) renders a Continue with Google button on the auth page. The credential JWT is exchanged with `POST /api/auth/google` as `{ id_token, client_id }`.

In GCP (project `fluito`, Web client only — do not invent extra client IDs), authorized **JavaScript origins** and **redirect URIs** must include:

- Production: `https://api.fluito.veritas.org.in`
- Local Vite: `http://localhost:5173`
- Local Bun: `http://localhost:4000`

Optional override: `VITE_GOOGLE_WEB_CLIENT_ID` (defaults to the Web client above).

## Features

- **Authentication**: Email/password or Google Sign-In, JWT stored in localStorage
- **Onboarding**: Forced when `GET /api/profiles/me` reports `profile_complete === false` (missing DOB/gender after Google)
- **Discover**: Swipe through potential matches; block or report the current card
- **Matches / Messages**: View matches, chat, unmatch, block, and report
- **Profile**: Update profile and preferences; delete account (type `DELETE` to confirm)
- **Legal**: Privacy Policy and Terms of Service (same-origin HTML from the API)
- **18+**: Register and onboarding reject under-18 DOBs with `You must be at least 18 years old to use Fluito`

## Theming

The app automatically switches themes based on user gender:
- **Blue theme**: Male users (and Google users until gender is set)
- **Pink theme**: Female users

Themes are applied via CSS variables and can be customized in `src/index.css`.
