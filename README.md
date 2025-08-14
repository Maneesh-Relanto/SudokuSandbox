# 🎯 5×5 Sudoku Game

A modern, responsive web-based Sudoku game featuring a unique 5×5 grid with irregular regions. Built with vanilla HTML, CSS, and JavaScript for optimal performance and compatibility.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Responsive](https://img.shields.io/badge/Responsive-Yes-green.svg)](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

## 🎮 Live Demo

[🎯 **PLAY NOW!**](https://maneesh-relanto.github.io/SudokuSandbox/) - No downloads needed, just click and play!

*Note: Enable GitHub Pages in repository settings to activate this link*

## ✨ Features

### 🎯 Core Game Features
- **5×5 Grid Layout** - Perfect size for quick games
- **Irregular Regions** - Unique colored regions instead of traditional 3×3 boxes
- **Three Difficulty Levels** - Easy, Medium, and Hard
- **Smart Validation** - Real-time error checking and highlighting
- **Timer** - Track your solving speed
- **Hint System** - Get help when you're stuck

### 🎨 User Experience
- **Modern UI Design** - Clean, professional interface with smooth animations
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Keyboard Support** - Use number keys 1-5 for quick input
- **Visual Feedback** - Color-coded regions and interactive elements
- **Comprehensive Instructions** - Built-in tutorial and game rules

### 🛠️ Game Controls
- **New Game** - Generate fresh puzzles
- **Hint** - Reveal correct number for selected cell
- **Check** - Validate current progress
- **Solve** - Show complete solution
- **Difficulty Selector** - Choose your challenge level

## 🎲 Difficulty Levels

| Level | Clues Provided | Description |
|-------|----------------|-------------|
| 🟢 **Easy** | 8-12 clues | Perfect for beginners and quick games |
| 🟡 **Medium** | 6-8 clues | Moderate challenge requiring logical thinking |
| 🔴 **Hard** | 4-6 clues | Challenging puzzles for experienced players |

## 🚀 Quick Start

### Option 1: Play Online
Simply open the [live demo](https://maneesh-relanto.github.io/SudokuSandbox/) in your browser and start playing!

### Option 2: Run Locally
1. **Clone the repository**
   ```bash
   git clone https://github.com/Maneesh-Relanto/SudokuSandbox.git
   cd SudokuSandbox
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your preferred browser
   open index.html  # macOS
   start index.html # Windows
   xdg-open index.html # Linux
   ```

That's it! No build process or dependencies required.

## 📱 Screenshots

### Desktop View
![Desktop Screenshot](https://via.placeholder.com/800x600/667eea/white?text=Desktop+View) *(Add actual screenshot)*

### Mobile View
![Mobile Screenshot](https://via.placeholder.com/300x600/667eea/white?text=Mobile+View) *(Add actual screenshot)*

## 🏗️ Architecture

### File Structure
```
SudokuSandbox/
├── index.html          # Main HTML structure
├── styles.css          # Responsive CSS styling
├── script.js           # Game logic and interactions
├── TESTING_REPORT.md   # Comprehensive testing documentation
└── README.md           # This file
```

### Technology Stack
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with flexbox/grid and animations
- **Vanilla JavaScript** - ES6+ features, no external dependencies
- **Responsive Design** - Mobile-first approach

## 🎯 Game Rules

### Objective
Fill the entire 5×5 grid with numbers 1-5 following these constraints:

### Rules
1. **Rows** - Each horizontal row must contain all numbers 1-5 (no repeats)
2. **Columns** - Each vertical column must contain all numbers 1-5 (no repeats)
3. **Regions** - Each colored region must contain all numbers 1-5 (no repeats)

### How to Play
1. Click on any empty cell to select it
2. Enter a number using the on-screen buttons or keyboard (1-5)
3. Use logic and elimination to solve the puzzle
4. Invalid moves will be highlighted in red
5. Complete the grid to win!

## 🧪 Testing

The game includes comprehensive testing and validation:

### Browser Console Commands
```javascript
// Run complete test suite
runFullTest()

// Test puzzle generation for all difficulties
testSudoku()

// Validate region definitions
testRegions()
```

### Test Coverage
- ✅ Puzzle generation algorithm
- ✅ Solution uniqueness validation
- ✅ Difficulty level scaling
- ✅ Region constraint checking
- ✅ User input validation
- ✅ Performance optimization

See [TESTING_REPORT.md](TESTING_REPORT.md) for detailed testing documentation.

## 🔧 Development

### Key Components

#### SudokuGame Class
The main game controller handling:
- Puzzle generation using backtracking algorithm
- Game state management
- User interaction handling
- Validation and error checking

#### Region System
Unique irregular regions instead of traditional 3×3 boxes:
```javascript
// Example region definition
regions = [
  [[0,0], [0,1], [1,0], [1,1], [2,0]], // Region 1 (red)
  [[0,2], [0,3], [0,4], [1,2], [1,3]], // Region 2 (teal)
  // ... more regions
];
```

#### Responsive Design
Mobile-first CSS with breakpoints:
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

## 🎨 Customization

### Styling
Modify `styles.css` to customize:
- Color schemes
- Animations
- Layout proportions
- Font choices

### Difficulty Levels
Adjust clue ranges in `script.js`:
```javascript
getCluesRange(difficulty) {
  switch (difficulty) {
    case 'easy': return { min: 8, max: 12 };
    case 'medium': return { min: 6, max: 8 };
    case 'hard': return { min: 4, max: 6 };
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Ideas
- [ ] Additional difficulty levels (Expert mode)
- [ ] Puzzle sharing functionality
- [ ] Daily challenges
- [ ] Statistics tracking
- [ ] Sound effects
- [ ] Themes and customization
- [ ] Multiplayer mode

## 📊 Performance

- **Lightweight** - No external dependencies
- **Fast Loading** - Optimized assets and minimal code
- **Smooth Animations** - 60fps CSS transitions
- **Memory Efficient** - Clean resource management

### Generation Times
- Easy puzzles: < 100ms
- Medium puzzles: < 200ms
- Hard puzzles: < 500ms

## 📱 Browser Support

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the classic Sudoku puzzle invented by Howard Garns
- Modern web design principles and best practices
- Community feedback and testing

## 📞 Contact

**Maneesh Thakur** - [Your Email] - [Your LinkedIn]

Project Link: [https://github.com/Maneesh-Relanto/SudokuSandbox](https://github.com/Maneesh-Relanto/SudokuSandbox)

---

### 🌟 Star this repository if you found it helpful!

Made with ❤️ by [Maneesh Thakur](https://github.com/Maneesh-Relanto)
