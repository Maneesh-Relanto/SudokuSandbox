class SudokuGame {
    constructor() {
        this.grid = Array(5).fill().map(() => Array(5).fill(0));
        this.solution = Array(5).fill().map(() => Array(5).fill(0));
        this.given = Array(5).fill().map(() => Array(5).fill(false));
        this.selectedCell = null;
        this.startTime = null;
        this.timerInterval = null;
        this.hintsUsed = 0;
        
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
    
    init() {
        this.createGrid();
        this.generatePuzzle();
        this.setupEventListeners();
        this.startTimer();
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
        
        // Remove numbers to create puzzle (leave 8-12 clues for easy difficulty)
        const cellsToRemove = this.getRandomInt(13, 17); // Remove 13-17 out of 25 cells
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
    
    generateSolution() {
        // Clear the solution grid
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                this.solution[row][col] = 0;
            }
        }
        
        // Fill the grid using backtracking
        this.solvePuzzle(this.solution);
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
        
        // Clear all cell styling
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'error', 'hint', 'solved');
        });
        
        document.getElementById('victory-modal').classList.add('hidden');
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
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
