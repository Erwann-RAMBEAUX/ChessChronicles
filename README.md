# ChessChronicles

**ChessChronicles** is a Chess.com aggregator and game analysis platform that lets you explore your chess journey in one place. Analyze your games with Stockfish, view your profile statistics, and (coming soon) dive into legendary games from chess history.

🌐 **[Visit ChessChronicles (Coming Soon)](https://chesschronicles.com)** - We're actively developing the platform. Check back soon for the official launch!

> ⚠️ **Project Status**: Currently in active development. Features are being added and refined regularly. Not all functionality is production-ready yet.

## What is ChessChronicles?

ChessChronicles is a full-stack web application that transforms how you interact with chess:

1. **Game Aggregator**: Search and filter all your Chess.com games in one place instead of navigating Chess.com's interface
2. **Real-Time Analyzer**: Get professional-grade move-by-move analysis using Stockfish engine with Chess.com-compatible accuracy metrics
3. **Profile Dashboard**: View your player statistics, win rates, and performance metrics at a glance
4. **Coming Soon - Legendary Games**: Explore the greatest chess games in history—Kasparov vs. Karpov, Kasparov vs. Computers, and other iconic matches. Analyze the moves of chess legends.

**Target Users**:
- Chess players who want to improve by analyzing their own games
- History enthusiasts interested in analyzing legendary games
- Players who play across multiple Chess.com time controls and want centralized access
- Users interested in data-driven chess improvement with easy-to-understand visualizations

---

## Features

### Currently Available ✅

**Game Discovery & Filtering**
- Search by Chess.com username
- Filter games by time control (Blitz, Rapid, Classical, Bullet, Daily, Live)
- Filter by result (Win, Loss, Draw)
- Filter by player color (White/Black)
- Filter by date range
- Search by opponent with autocomplete
- Sort and organize your game library

**Profile Dashboard**
- View player statistics from Chess.com
- See your overall performance metrics
- Access player information at a glance

**Real-Time Game Analysis**
- Upload or search for any of your Chess.com games
- Get instant Stockfish analysis (depth 20)
- Move-by-move evaluation with CPL classification
- Evaluation bar showing position advantage
- Mate detection and forced sequence highlighting
- Opening theory recognition for theoretical moves
- Comprehensive statistics: excellent moves, inaccuracies, mistakes, blunders

**Multi-Language Support**
- English and French interfaces
- Automatic language detection based on browser settings
- Easy language switching via URL parameter

### Coming Soon 🚀

**Legendary Games Page**
- Explore the greatest games in chess history
- Iconic matches: Kasparov vs. Karpov, Kasparov vs. Deep Blue, and more
- Full analysis of legendary games using Stockfish
- Learn from the moves of chess legends
- Immersive game replay with real-time commentary
- Filter by era, player, or significance

---

## How It Works

### 1. Search Your Games
Enter your Chess.com username and ChessChronicles fetches all your games from the Chess.com Public API. Games appear progressively as they're loaded, organized newest first.

### 2. Filter & Browse
Use powerful filters to find specific games:
- Playing with a particular opponent?
- Looking for your Blitz classics?
- Want to review only your losses?
- ChessChronicles makes it easy.

### 3. Analyze Deep
Select any game to get instant professional analysis:
- Every move is evaluated by Stockfish at depth 20
- Move quality is classified using the same CPL algorithm as Chess.com
- Evaluation bar shows how the position swung
- See what the best moves were

### 4. Explore Legendary Games (Coming Soon)
Dive into the greatest matches in chess history:
- Relive Kasparov's legendary battles
- Analyze classical masterpieces with Stockfish
- Learn from iconic positions and strategic decisions
- Get the same deep analysis on historical games as you do on your own
