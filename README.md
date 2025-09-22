# Celestial - Climate Action Evidence Sharing Platform

A decentralized application built on the Internet Computer Protocol (ICP) for sharing climate action evidence and fostering environmental awareness.

## Features

- **Climate Action Tracking**: Upload and share evidence of climate actions with photos, coordinates, and descriptions
- **User Profiles**: Create and manage user profiles with display names and bios
- **Interactive Map**: View climate actions on an interactive map using Leaflet
- **Chat System**: Real-time messaging between users
- **Notification System**: Get notified about new climate actions and updates
- **Access Control**: Role-based permissions (admin, user, guest)
- **Internet Identity**: Secure authentication using Internet Identity
- **Blob Storage**: Decentralized file storage for photos and documents
- **Weather Integration**: Fetch weather data via HTTP outcalls

## Project Structure

```
├── backend/                    # Motoko backend canisters
│   ├── main.mo                # Main canister with all functionality
│   ├── authorization/         # Access control system
│   ├── blob-storage/          # File storage registry
│   └── http-outcalls/         # External API integration
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   └── blob-storage/      # File storage utilities
│   ├── dist/                  # Build output (generated)
│   └── index.html
└── dfx.json                   # DFX configuration
```

## Prerequisites

- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/) >= 0.15.0
- Node.js >= 18.0.0
- npm or yarn

## Installation

1. **Install DFX** (if not already installed):
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

## Development

### Start Local Development Environment

1. **Start the local ICP replica**:
   ```bash
   dfx start --clean
   ```

2. **Deploy canisters locally**:
   ```bash
   dfx deploy
   ```

3. **Start the frontend development server** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend canister: http://localhost:8000/?canisterId={canister_id}

### Build for Production

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to production**:
   ```bash
   dfx deploy --network ic
   ```

## Available Scripts

### Backend (Motoko)
- `dfx canister create celestial_backend` - Create the backend canister
- `dfx build celestial_backend` - Build the backend canister
- `dfx canister install celestial_backend` - Install the backend canister

### Frontend (React)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Canister Configuration

The `dfx.json` file defines two canisters:

1. **celestial_backend**: Motoko canister containing all the business logic
2. **celestial_frontend**: Asset canister serving the React application

## API Endpoints

The backend provides the following main functions:

- `uploadClimateAction()` - Upload evidence of climate actions
- `getAllClimateActions()` - Retrieve all climate actions
- `saveCallerUserProfile()` - Save user profile information
- `sendChatMessage()` - Send chat messages
- `getNotifications()` - Get user notifications
- `fetchWeatherData()` - Fetch weather information

## Environment Variables

Create a `.env` file in the frontend directory for configuration:

```env
VITE_CANISTER_ID_BACKEND=your_backend_canister_id
VITE_INTERNET_IDENTITY_URL=https://identity.ic0.app
```

## Deployment

### Local Development
```bash
dfx start --clean
dfx deploy
```

### Mainnet Deployment
```bash
dfx deploy --network ic
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `dfx deploy`
5. Submit a pull request

## License

This project is licensed under the MIT License.
