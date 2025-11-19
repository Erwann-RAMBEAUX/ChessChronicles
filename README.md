# Chess Chronicles

**Chess Chronicles** is a modern web application designed for chess enthusiasts. It serves as a comprehensive platform to analyze your games, track your progress via Chess.com integration, and explore legendary matches from chess history.

Built with a focus on performance, aesthetics, and user experience, Chess Chronicles leverages the power of Stockfish for real-time analysis and offers a fully localized interface in 7 languages.

🌐 **[Live Demo](https://chesschronicles.com)**

---

## ✨ Key Features

### 📊 Game Aggregator & Profile
- **Chess.com Integration**: Seamlessly fetch and browse your game history by username.
- **Advanced Filtering**: Filter games by time control (Blitz, Rapid, Bullet), result (Win, Loss, Draw), color, and date.
- **Player Statistics**: View detailed profile stats, ratings, and performance metrics.

### 🧠 Professional Analysis
- **Stockfish Engine**: Real-time, in-browser analysis (depth 20+) using `stockfish.js`.
- **Move Classification**: Automatic detection of Brilliancies, Mistakes, Blunders, and Book Moves.
- **Evaluation Bar**: Visual representation of the game's balance after every move.
- **Interactive Board**: Replay moves, try variations, and understand the "why" behind every position.

### 🏆 Legendary Games (Soon)
- **Historic Library**: A curated collection of the most iconic games in chess history (e.g., Kasparov vs. Topalov, Fischer vs. Spassky).
- **Learn from Legends**: Analyze these masterpieces move-by-move to understand grandmaster strategy.

### 🌍 Internationalization (i18n)
- **7 Supported Languages**: English, French, Spanish, Italian, Portuguese, Russian, Hindi.
- **Auto-Detection**: Automatically detects user's preferred language.
- **SEO Optimized**: Fully localized metadata and URL structure (e.g., `/fr/about`, `/es/analyze`).

### 🚀 Modern Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Dark mode, responsive design)
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Internationalization**: i18next, react-i18next
- **SEO**: react-helmet-async
- **Chess Logic**: chess.js, react-chessboard

---

## 📂 Project Structure

```
ChessChronicles/
├── public/              # Static assets (locales, images, sitemap)
├── src/
│   ├── components/      # Reusable UI components (Footer, Header, GameCard...)
│   ├── routes/          # Page components (HomePage, AnalyzePage, AboutPage...)
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand state stores
│   ├── utils/           # Helper functions (chess logic, formatting)
│   ├── i18n.ts          # Internationalization configuration
│   └── main.tsx         # Application entry point
├── index.html           # HTML entry point
└── package.json         # Project dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Whether it's reporting a bug, suggesting a feature, or submitting a pull request, your input is valued.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

**Developed with ❤️ by Erwann RAMBEAUX (in collaboration with AI)**
