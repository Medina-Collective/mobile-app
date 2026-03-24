# Medina — Mobile App

The official mobile app for [Medina Collective](https://github.com/Medina-Collective). Built with React Native, Expo, and TypeScript.

---

## Prerequisites

Make sure the following are installed on your machine before getting started.

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18 or later | [nodejs.org](https://nodejs.org) |
| npm | 9 or later | Comes with Node |
| Expo Go | Latest | [iOS](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| Xcode | 15+ | Mac App Store (iOS only) |
| Android Studio | Latest | [developer.android.com](https://developer.android.com/studio) (Android only) |

> You only need Xcode **or** Android Studio depending on which platform you're targeting. Expo Go lets you run the app on a physical device without either.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Medina-Collective/mobile-app.git
cd mobile-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.medinacollective.org/v1
EXPO_PUBLIC_APP_ENV=development
```

### 4. Start the development server

```bash
npm start
```

This opens the Expo Dev Tools in your terminal. From there:

| Key | Action |
|-----|--------|
| `i` | Open on iOS Simulator |
| `a` | Open on Android Emulator |
| `w` | Open in web browser |
| Scan QR | Open in Expo Go on your phone |

---

## Running on a Specific Platform

```bash
# iOS Simulator (requires Xcode on macOS)
npm run ios

# Android Emulator (requires Android Studio)
npm run android

# Web browser
npm run web
```

---

## Development Commands

```bash
# Type check the entire project
npm run typecheck

# Lint
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format source files with Prettier
npm run format
```

---

## Project Structure

```
mobile-app/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx         # Root layout — providers, fonts, splash screen
│   ├── (auth)/             # Unauthenticated screens (Welcome, Sign In, Sign Up)
│   └── (tabs)/             # Authenticated tab navigation (Home, Events, Discover, Favorites, Profile)
├── src/
│   ├── components/         # Shared UI components (Text, Button, Input, Card, Screen)
│   ├── features/           # Feature modules (auth, events, discover, …)
│   ├── services/           # API client (Axios) and Query client (TanStack Query)
│   ├── store/              # Global state (Zustand)
│   ├── theme/              # Design system — colors, spacing, typography
│   ├── types/              # Shared TypeScript types
│   ├── constants/          # App-wide constants and query keys
│   └── utils/              # Utility functions (storage, formatting)
├── assets/                 # Images, fonts, icons
├── app.json                # Expo configuration
├── babel.config.js         # Babel + path aliases
└── tsconfig.json           # TypeScript strict config
```

### Path aliases

Import using short aliases instead of relative paths:

```ts
import { Button } from '@components/ui';
import { colors } from '@theme/colors';
import { useAuth } from '@features/auth';
import { apiClient } from '@services/api.client';
```

| Alias | Resolves to |
|-------|-------------|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@features/*` | `src/features/*` |
| `@theme/*` | `src/theme/*` |
| `@services/*` | `src/services/*` |
| `@store/*` | `src/store/*` |
| `@hooks/*` | `src/hooks/*` |
| `@utils/*` | `src/utils/*` |
| `@constants/*` | `src/constants/*` |
| `@app-types/*` | `src/types/*` |
| `@assets/*` | `assets/*` |

---

## Tech Stack

| Category | Library |
|----------|---------|
| Framework | [Expo SDK 55](https://docs.expo.dev) + [React Native 0.83](https://reactnative.dev) |
| Routing | [Expo Router v3](https://expo.github.io/router) |
| Language | TypeScript (strict) |
| State | [Zustand v5](https://zustand-demo.pmnd.rs) |
| Data fetching | [TanStack Query v5](https://tanstack.com/query/v5) |
| HTTP | [Axios](https://axios-http.com) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Storage | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage) |
| Linting | ESLint + Prettier |

---

## Troubleshooting

**`Cannot find module '@expo/cli'`**
```bash
npm install @expo/cli
```

**Metro bundler cache issues**
```bash
npm start -- --clear
```

**iOS build fails after installing a new package**
```bash
cd ios && pod install && cd ..
```

**Android build fails after installing a new package**
```bash
cd android && ./gradlew clean && cd ..
```

**Type errors after pulling new changes**
```bash
npm install
npm run typecheck
```

---

## Contributing

1. Branch off `main` using the convention `feature/your-feature-name`
2. Run `npm run typecheck` and `npm run lint` before pushing
3. Open a pull request against `main`
