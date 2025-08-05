# P2P - Firebase Authentication

A Next.js application with persistent Firebase Authentication featuring email/password and Google sign-in methods.

## Features

- 🔐 **Persistent Authentication** - Users stay logged in across browser sessions
- 📧 **Email/Password Authentication** - Traditional login and signup
- 🔑 **Google OAuth** - Sign in with Google accounts
- 👤 **User Profile Management** - View and edit user information
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- ⚡ **TypeScript** - Full type safety throughout the application

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd p2p
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Authentication in the Firebase console
   - Add Email/Password and Google sign-in methods
   - Go to Project Settings > General
   - Scroll down to "Your apps" and add a web app
   - Copy the Firebase configuration

4. Configure environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Main page with auth logic
├── components/
│   └── auth/              # Authentication components
│       ├── AuthContainer.tsx
│       ├── LoginForm.tsx
│       ├── SignUpForm.tsx
│       └── UserProfile.tsx
├── contexts/
│   └── AuthContext.tsx    # Firebase auth context
└── lib/
    └── firebase.ts        # Firebase configuration
```

## Authentication Features

### Sign Up
- Email and password registration
- Display name (optional)
- Password confirmation
- Validation for password length and matching

### Sign In
- Email and password authentication
- Google OAuth sign-in
- Error handling for invalid credentials

### User Profile
- View user information
- Edit display name
- Account creation and last sign-in dates
- Profile picture (from Google account)
- Sign out functionality

### Persistence
- Authentication state persists across browser sessions
- Automatic login restoration on page refresh
- Loading states during authentication checks

## Development

### Using Firebase Emulator (Optional)

For local development, you can use Firebase Emulator:

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase in your project:
```bash
firebase init emulators
```

3. Start the emulator:
```bash
firebase emulators:start
```

4. Enable emulator in your `.env.local`:
```env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Make sure to set the environment variables in your deployment platform's configuration.

## Security Notes

- Firebase handles all authentication security
- Environment variables are properly configured for client-side use
- No sensitive data is stored in the application
- Authentication state is managed by Firebase SDK

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
