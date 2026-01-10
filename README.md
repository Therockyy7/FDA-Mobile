# Expo Base Starter Kit

This is a comprehensive starter kit for building cross-platform mobile applications using Expo and React Native. It's designed to provide a solid foundation with a modern tech stack and a scalable project structure, allowing you to start developing features right away.

This boilerplate comes pre-configured with essential tools for routing, state management, styling, and data fetching, saving you from the initial setup hassle.

## ✨ Features

- **Expo Router**: A powerful file-system-based router for React Native.
- **TypeScript**: For type safety and improved developer experience.
- **Tailwind CSS (NativeWind)**: A utility-first CSS framework for rapid UI development.
- **Redux Toolkit**: A scalable state management solution.
- **React Hook Form**: Performant, flexible, and extensible forms with easy-to-use validation.
- **Feature-Sliced Design**: A scalable architecture for organizing your codebase.
- **ESLint & Prettier**: For consistent code style and quality.
- **Dark Mode Support**: Built-in support for light and dark themes.

## 🥞 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) via [NativeWind](https://www.nativewind.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Backend & Database**: [Supabase](https://supabase.io/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Linting**: [ESLint](https://eslint.org/)
- **Formatting**: [Prettier](https://prettier.io/)

## 📂 Project Structure

This starter kit uses a feature-based directory structure to promote modularity and scalability. Instead of grouping files by type (e.g., all components in one folder, all hooks in another), code is organized by feature.

```
/
├── app/                # Expo Router routes (the "screens" of your app)
├── assets/             # Static assets like fonts and images
├── components/         # Global, shared, and reusable UI components
│   └── ui/             # Unstyled base components (Button, Input, etc.)
├── features/           # Feature-specific modules
│   ├── auth/           # Authentication feature
│   │   ├── components/ # React components specific to auth
│   │   ├── stores/     # Zustand stores for auth state
│   │   └── utils/      # Utility functions for auth
│   └── notes/          # Notes feature
│       ├── components/
│       ├── hooks/      # React Query hooks for notes
│       ├── services/   # Data fetching services for notes
│       └── types/      # TypeScript types for the notes feature
├── lib/                # Core libraries and utilities (Supabase client, constants)
├── services/           # Global API service definitions
├── supabase-migrations/ # Database migration scripts for Supabase
└── ...
```

### The `features` Directory

The `/features` directory is the heart of the application's business logic. Each subdirectory represents a distinct feature (e.g., `auth`, `profile`, `notes`). Inside each feature folder, you'll find all the code related to that feature:
- **`components`**: React components that are only used within this feature.
- **`hooks`**: React Query or other hooks for data fetching and logic.
- **`services`**: Functions that interact with APIs or external services.
- **`stores`**: State management stores (e.g., Zustand) for the feature's state.
- **`types`**: TypeScript interfaces and type definitions.

This approach makes the codebase easier to navigate and maintain as it grows. It also encourages code reusability and separation of concerns.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sawsew467/expo-starter-kit
    cd expo-starter-kit
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Copy the example `.env.example` file to a new `.env` file:
        ```bash
        cp .env.example .env
        ```
    -   Open the `.env` file and add your Supabase URL and Anon Key. You can find these in your Supabase project's API settings.

4.  **Run the application:**
    ```bash
    npm start
    ```
    This will start the Metro bundler. You can then run the app on a simulator or a physical device.

    -   Press `i` to run on the iOS Simulator.
    -   Press `a` to run on the Android Emulator.
    -   Scan the QR code with the Expo Go app on your phone.

## 📜 Available Scripts

- `npm start`: Starts the development server.
- `npm run android`: Runs the app on a connected Android device or emulator.
- `npm run ios`: Runs the app on the iOS simulator.
- `npm run web`: Runs the app in a web browser.
- `npm run lint`: Lints the codebase using ESLint.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
