# Quanto

Quanto is a clean, calculator-style currency converter built with Expo + React Native. It pulls live rates from Open Exchange Rates and lets you swipe between currencies, tap to search, and do quick math before converting.

## Features
- Live FX rates via Open Exchange Rates
- Calculator keypad with basic operators
- Swipe left/right to cycle currencies
- Searchable currency picker
- Expo Router navigation

## Getting started

### 1) Install dependencies
```bash
bun install
# or
npm install
```

### 2) Configure environment
Create a `.env` file in the project root:
```bash
EXPO_PUBLIC_OXR_APP_ID=your_open_exchange_rates_app_id
```

You can sign up for a free API key at Open Exchange Rates.

### 3) Run the app
```bash
bun start
# or
npm run start
```

Then follow the Expo prompts to open on iOS, Android, or web.

## Scripts
- `bun start` / `npm run start` – start Expo
- `bun android` / `npm run android` – run on Android
- `bun ios` / `npm run ios` – run on iOS
- `bun web` / `npm run web` – run on web

## Notes
Rates are fetched relative to USD and converted using `rate_to / rate_from`.
