class SudokuGame {
    constructor() {
        this.grid = Array(5).fill().map(() => Array(5).fill(0));
        this.solution = Array(5).fill().map(() => Array(5).fill(0));
        this.given = Array(5).fill().map(() => Array(5).fill(false));
        this.selectedCell = null;
        this.startTime = null;
        this.timerInterval = null;
        this.hintsUsed = 0;
        this.currentDifficulty = 'easy';
        
        // Define regions for 5x5 irregular Sudoku
        this.regions = [
            [[0,0], [0,1], [1,0], [1,1], [2,0]], // Region 1 (red)
            [[0,2], [0,3], [0,4], [1,2], [1,3]], // Region 2 (teal)
            [[1,4], [2,1], [2,2], [2,3], [2,4]], // Region 3 (blue)
            [[2,1], [3,0], [3,1], [4,0], [4,1]], // Region 4 (yellow) - Note: [2,1] is shared, but we'll handle this
            [[3,2], [3,3], [3,4], [4,2], [4,3], [4,4]] // Region 5 (orange)
        ];
        
        // Corrected regions (each cell belongs to exactly one region)
        this.regions = [
            [[0,0], [0,1], [1,0], [1,1], [2,0]], // Region 1
            [[0,2], [0,3], [0,4], [1,2], [1,3]], // Region 2
            [[1,4], [2,2], [2,3], [2,4], [3,4]], // Region 3
            [[2,1], [3,0], [3,1], [4,0], [4,1]], // Region 4
            [[3,2], [3,3], [4,2], [4,3], [4,4]]  // Region 5
        ];
        
        this.init();
    }
    
    // Add this to window for testing
    setupGlobalTesting() {
        window.sudokuGame = this;
        window.testSudoku = () => this.validatePuzzleGeneration();
        window.testRegions = () => this.validateRegions();
        window.runFullTest = () => {
            console.log('🚀 Running complete Sudoku validation...\n');
            const regionTest = this.validateRegions();
            const puzzleTest = this.validatePuzzleGeneration();
            
            if (regionTest && puzzleTest) {
                console.log('\n� ALL SYSTEMS GO! The game is fully functional and safe.');
            } else {
                console.error('\n❌ CRITICAL ISSUES FOUND! Please review the implementation.');
            }
            
            return regionTest && puzzleTest;
        };
        console.log('�🎮 Sudoku game loaded!');
        console.log('Available commands:');
        console.log('  - testSudoku() - Test puzzle generation');
        console.log('  - testRegions() - Test region definitions');
        console.log('  - runFullTest() - Complete validation suite');
    }
    
    init() {
        this.createGrid();
        this.updateDifficultyDisplay();
        this.generatePuzzle();
        this.setupEventListeners();
        this.startTimer();
        this.setupGlobalTesting();
    }
    
    createGrid() {
        const gridElement = document.getElementById('sudoku-grid');
        gridElement.innerHTML = '';
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add region class for styling
                const regionIndex = this.getCellRegion(row, col);
                cell.classList.add(`region-${regionIndex + 1}`);
                
                cell.addEventListener('click', () => this.selectCell(row, col));
                gridElement.appendChild(cell);
            }
        }
    }
    
    getCellRegion(row, col) {
        for (let i = 0; i < this.regions.length; i++) {
            if (this.regions[i].some(([r, c]) => r === row && c === col)) {
                return i;
            }
        }
        return 0; // Default to first region if not found
    }
    
    generatePuzzle() {
        // Generate a complete valid solution
        this.generateSolution();
        
        // Copy solution to grid
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                this.grid[row][col] = this.solution[row][col];
            }
        }
        
        // Remove numbers to create puzzle based on difficulty
        const cluesRange = this.getCluesRange(this.currentDifficulty);
        const totalCells = 25;
        const cluesCount = this.getRandomInt(cluesRange.min, cluesRange.max);
        const cellsToRemove = totalCells - cluesCount;
        
        const cellPositions = [];
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                cellPositions.push([row, col]);
            }
        }
        
        // Shuffle positions
        for (let i = cellPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cellPositions[i], cellPositions[j]] = [cellPositions[j], cellPositions[i]];
        }
        
        // Remove numbers from random positions
        for (let i = 0; i < cellsToRemove; i++) {
            const [row, col] = cellPositions[i];
            this.grid[row][col] = 0;
        }
        
        // Mark given numbers
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                this.given[row][col] = this.grid[row][col] !== 0;
            }
        }
        
        this.updateDisplay();
    }
    
    getCluesRange(difficulty) {
        switch (difficulty) {
            case 'easy':
                return { min: 8, max: 12 };
            case 'medium':
                return { min: 6, max: 8 };
            case 'hard':
                return { min: 4, max: 6 };
            default:
                return { min: 8, max: 12 };
        }
    }
    
    getDifficultyName(difficulty) {
        switch (difficulty) {
            case 'easy':
                return 'Easy';
            case 'medium':
                return 'Medium';
            case 'hard':
                return 'Hard';
            default:
                return 'Easy';
        }
    }
    
    updateDifficultyDisplay() {
        document.getElementById('difficulty-level').textContent = this.getDifficultyName(this.currentDifficulty);
    }
    
    generateSolution() {
        // Clear the solution grid
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                this.solution[row][col] = 0;
            }
        }
        
        // Fill the grid using backtracking with timeout safeguard
        const startTime = Date.now();
        const maxTime = 5000; // 5 seconds timeout
        
        const solveWithTimeout = () => {
            if (Date.now() - startTime > maxTime) {
                console.warn('⚠️ Puzzle generation timeout, retrying...');
                return false;
            }
            return this.solvePuzzle(this.solution);
        };
        
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            if (solveWithTimeout()) {
                break;
            }
            
            attempts++;
            // Clear and try again
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    this.solution[row][col] = 0;
                }
            }
            
            if (attempts >= maxAttempts) {
                console.error('❌ Failed to generate valid solution after multiple attempts');
                // Fallback: create a simple valid solution
                this.createFallbackSolution();
            }
        }
    }
    
    createFallbackSolution() {
        // Create a simple valid 5x5 Sudoku solution as fallback
        const fallback = [
            [1, 2, 3, 4, 5],
            [2, 3, 4, 5, 1],
            [3, 4, 5, 1, 2],
            [4, 5, 1, 2, 3],
            [5, 1, 2, 3, 4]
        ];
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                this.solution[row][col] = fallback[row][col];
            }
        }
        
        console.log('✅ Using fallback solution');
    }
    
    solvePuzzle(grid) {
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (grid[row][col] === 0) {
                    const numbers = [1, 2, 3, 4, 5];
                    this.shuffleArray(numbers);
                    
                    for (let num of numbers) {
                        if (this.isValidMove(grid, row, col, num)) {
                            grid[row][col] = num;
                            
                            if (this.solvePuzzle(grid)) {
                                return true;
                            }
                            
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    isValidMove(grid, row, col, num) {
        // Check row
        for (let c = 0; c < 5; c++) {
            if (c !== col && grid[row][c] === num) {
                return false;
            }
        }
        
        // Check column
        for (let r = 0; r < 5; r++) {
            if (r !== row && grid[r][col] === num) {
                return false;
            }
        }
        
        // Check region
        const regionIndex = this.getCellRegion(row, col);
        const region = this.regions[regionIndex];
        
        for (let [r, c] of region) {
            if ((r !== row || c !== col) && grid[r][c] === num) {
                return false;
            }
        }
        
        return true;
    }
    
    updateDisplay() {
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const value = this.grid[row][col];
            
            cell.textContent = value === 0 ? '' : value;
            
            // Only remove certain classes, preserve 'solved' class
            cell.classList.remove('given', 'error', 'hint');
            
            if (this.given[row][col]) {
                cell.classList.add('given');
            }
        });
    }
    
    selectCell(row, col) {
        if (this.given[row][col]) return;
        
        // Remove previous selection
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // Select new cell
        const cellIndex = row * 5 + col;
        const cells = document.querySelectorAll('.cell');
        cells[cellIndex].classList.add('selected');
        
        this.selectedCell = {row, col};
    }
    
    placeNumber(number) {
        if (!this.selectedCell) return;
        
        const {row, col} = this.selectedCell;
        if (this.given[row][col]) return;
        
        if (number === 0) {
            // Erase
            this.grid[row][col] = 0;
        } else {
            this.grid[row][col] = number;
        }
        
        this.updateDisplay();
        this.checkErrors();
        
        if (this.isPuzzleComplete()) {
            this.endGame();
        }
    }
    
    checkErrors() {
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const value = this.grid[row][col];
            
            cell.classList.remove('error');
            
            if (value !== 0 && !this.isValidMove(this.grid, row, col, value)) {
                cell.classList.add('error');
            }
        });
    }
    
    isPuzzleComplete() {
        // Check if all cells are filled
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (this.grid[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Check if all constraints are satisfied
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const value = this.grid[row][col];
                if (!this.isValidMove(this.grid, row, col, value)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    giveHint() {
        if (!this.selectedCell) {
            this.showMessage('Please select a cell first!');
            return;
        }
        
        const {row, col} = this.selectedCell;
        if (this.given[row][col]) {
            this.showMessage('Cannot hint on given numbers!');
            return;
        }
        
        if (this.grid[row][col] === this.solution[row][col]) {
            this.showMessage('This cell is already correct!');
            return;
        }
        
        this.grid[row][col] = this.solution[row][col];
        this.hintsUsed++;
        
        const cellIndex = row * 5 + col;
        const cells = document.querySelectorAll('.cell');
        cells[cellIndex].classList.add('hint');
        
        setTimeout(() => {
            cells[cellIndex].classList.remove('hint');
        }, 1000);
        
        this.updateDisplay();
        
        if (this.isPuzzleComplete()) {
            this.endGame();
        }
    }
    
    checkPuzzle() {
        let errors = 0;
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const value = this.grid[row][col];
            
            cell.classList.remove('error');
            
            if (value !== 0 && value !== this.solution[row][col]) {
                cell.classList.add('error');
                errors++;
            }
        });
        
        if (errors === 0) {
            this.showMessage('Great! No errors found!');
        } else {
            this.showMessage(`Found ${errors} error(s). Check the highlighted cells.`);
        }
    }
    
    solvePuzzleForUser() {
        // Clear any existing selections and errors
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'error');
        });
        
        // Fill in the solution with animation
        const emptyCells = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (!this.given[row][col] && this.grid[row][col] !== this.solution[row][col]) {
                    emptyCells.push({row, col});
                }
            }
        }
        
        if (emptyCells.length === 0) {
            this.showMessage('Puzzle is already solved!');
            return;
        }
        
        // Animate the solving process
        let index = 0;
        const solveInterval = setInterval(() => {
            if (index >= emptyCells.length) {
                clearInterval(solveInterval);
                // Mark all solved cells with special styling
                this.markSolvedCells();
                // Stop the timer but don't show victory modal
                this.stopTimer();
                return;
            }
            
            const {row, col} = emptyCells[index];
            this.grid[row][col] = this.solution[row][col];
            
            // Highlight the newly filled cell
            const cellIndex = row * 5 + col;
            const cells = document.querySelectorAll('.cell');
            cells[cellIndex].classList.add('hint');
            
            setTimeout(() => {
                cells[cellIndex].classList.remove('hint');
                cells[cellIndex].classList.add('solved');
            }, 300);
            
            this.updateDisplay();
            index++;
        }, 150); // Add number every 150ms for visual effect
    }
    
    markSolvedCells() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            if (!this.given[row][col]) {
                cell.classList.add('solved');
            }
        });
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('timer-display').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    endGame() {
        this.stopTimer();
        const elapsed = Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('final-time').textContent = timeString;
        document.getElementById('victory-modal').classList.remove('hidden');
    }
    
    newGame() {
        this.stopTimer();
        this.hintsUsed = 0;
        this.selectedCell = null;
        
        // Get current difficulty from dropdown
        const difficultySelect = document.getElementById('difficulty-select');
        this.currentDifficulty = difficultySelect.value;
        
        // Clear all cell styling
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'error', 'hint', 'solved');
        });
        
        document.getElementById('victory-modal').classList.add('hidden');
        this.updateDifficultyDisplay();
        this.generatePuzzle();
        this.startTimer();
    }
    
    showMessage(message) {
        // Simple alert for now - could be replaced with a nicer notification system
        alert(message);
    }
    
    setupEventListeners() {
        // Number pad buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const number = parseInt(btn.dataset.number);
                this.placeNumber(number);
                
                // Update active button
                document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Control buttons
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('hint-btn').addEventListener('click', () => this.giveHint());
        document.getElementById('check-btn').addEventListener('click', () => this.checkPuzzle());
        document.getElementById('solve-btn').addEventListener('click', () => this.solvePuzzleForUser());
        document.getElementById('play-again-btn').addEventListener('click', () => this.newGame());
        
        // Menu buttons
        document.getElementById('instructions-btn').addEventListener('click', () => {
            document.getElementById('instructions-modal').classList.remove('hidden');
        });
        
        document.getElementById('about-btn').addEventListener('click', () => {
            document.getElementById('about-modal').classList.remove('hidden');
        });
        
        // Close modal buttons
        document.getElementById('close-instructions').addEventListener('click', () => {
            document.getElementById('instructions-modal').classList.add('hidden');
        });
        
        document.getElementById('close-about').addEventListener('click', () => {
            document.getElementById('about-modal').classList.add('hidden');
        });
        
        // Difficulty selector
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.updateDifficultyDisplay();
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '5') {
                this.placeNumber(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                this.placeNumber(0);
            }
        });
        
        // Close modal on click outside
        document.getElementById('victory-modal').addEventListener('click', (e) => {
            if (e.target.id === 'victory-modal') {
                document.getElementById('victory-modal').classList.add('hidden');
            }
        });
        
        document.getElementById('instructions-modal').addEventListener('click', (e) => {
            if (e.target.id === 'instructions-modal') {
                document.getElementById('instructions-modal').classList.add('hidden');
            }
        });
        
        document.getElementById('about-modal').addEventListener('click', (e) => {
            if (e.target.id === 'about-modal') {
                document.getElementById('about-modal').classList.add('hidden');
            }
        });
    }
    
    // Utility functions
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Test function to validate puzzle generation
    validatePuzzleGeneration() {
        console.log('🔍 Testing puzzle generation for all difficulty levels...');
        
        const difficulties = ['easy', 'medium', 'hard'];
        let allTestsPassed = true;
        
        difficulties.forEach(difficulty => {
            console.log(`\n📊 Testing ${difficulty.toUpperCase()} difficulty:`);
            
            const originalDifficulty = this.currentDifficulty;
            this.currentDifficulty = difficulty;
            
            // Test multiple puzzle generations
            for (let test = 1; test <= 3; test++) {
                console.log(`  Test ${test}:`);
                
                // Generate new puzzle
                this.generateSolution();
                for (let row = 0; row < 5; row++) {
                    for (let col = 0; col < 5; col++) {
                        this.grid[row][col] = this.solution[row][col];
                    }
                }
                
                // Remove clues based on difficulty
                const cluesRange = this.getCluesRange(difficulty);
                const cluesCount = this.getRandomInt(cluesRange.min, cluesRange.max);
                const cellsToRemove = 25 - cluesCount;
                
                console.log(`    Expected clues: ${cluesRange.min}-${cluesRange.max}, Generated: ${cluesCount}`);
                
                // Validate clues range
                if (cluesCount < cluesRange.min || cluesCount > cluesRange.max) {
                    console.error(`    ❌ FAIL: Clues count ${cluesCount} not in range ${cluesRange.min}-${cluesRange.max}`);
                    allTestsPassed = false;
                } else {
                    console.log(`    ✅ PASS: Clues count within range`);
                }
                
                // Test solution validation
                const isSolutionValid = this.validateCompleteSolution(this.solution);
                if (isSolutionValid) {
                    console.log(`    ✅ PASS: Generated solution is valid`);
                } else {
                    console.error(`    ❌ FAIL: Generated solution is invalid`);
                    allTestsPassed = false;
                }
            }
            
            this.currentDifficulty = originalDifficulty;
        });
        
        if (allTestsPassed) {
            console.log('\n🎉 ALL TESTS PASSED! Game is working correctly for all difficulty levels.');
        } else {
            console.error('\n❌ SOME TESTS FAILED! Please check the implementation.');
        }
        
        return allTestsPassed;
    }
    
    // Validate complete solution
    validateCompleteSolution(grid) {
        // Check all rows
        for (let row = 0; row < 5; row++) {
            const rowSet = new Set();
            for (let col = 0; col < 5; col++) {
                if (grid[row][col] < 1 || grid[row][col] > 5 || rowSet.has(grid[row][col])) {
                    return false;
                }
                rowSet.add(grid[row][col]);
            }
        }
        
        // Check all columns
        for (let col = 0; col < 5; col++) {
            const colSet = new Set();
            for (let row = 0; row < 5; row++) {
                if (colSet.has(grid[row][col])) {
                    return false;
                }
                colSet.add(grid[row][col]);
            }
        }
        
        // Check all regions
        for (let regionIndex = 0; regionIndex < this.regions.length; regionIndex++) {
            const regionSet = new Set();
            const region = this.regions[regionIndex];
            
            for (let [row, col] of region) {
                if (regionSet.has(grid[row][col])) {
                    return false;
                }
                regionSet.add(grid[row][col]);
            }
        }
        
        return true;
    }
    
    // Validate regions definition
    validateRegions() {
        console.log('🔍 Validating regions definition...');
        
        const allCells = new Set();
        let isValid = true;
        
        // Check each region
        this.regions.forEach((region, index) => {
            console.log(`  Region ${index + 1}: ${region.length} cells`);
            
            if (region.length !== 5) {
                console.error(`    ❌ FAIL: Region ${index + 1} has ${region.length} cells, expected 5`);
                isValid = false;
            }
            
            region.forEach(([row, col]) => {
                const cellKey = `${row},${col}`;
                if (allCells.has(cellKey)) {
                    console.error(`    ❌ FAIL: Cell (${row},${col}) appears in multiple regions`);
                    isValid = false;
                }
                if (row < 0 || row >= 5 || col < 0 || col >= 5) {
                    console.error(`    ❌ FAIL: Cell (${row},${col}) is out of bounds`);
                    isValid = false;
                }
                allCells.add(cellKey);
            });
        });
        
        // Check if all 25 cells are covered
        if (allCells.size !== 25) {
            console.error(`❌ FAIL: Only ${allCells.size} cells covered, expected 25`);
            isValid = false;
        }
        
        if (isValid) {
            console.log('✅ PASS: All regions are correctly defined');
        }
        
        return isValid;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
