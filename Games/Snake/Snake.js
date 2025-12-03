// Game variables
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');
        const gridSize = 20;
        const gameWidth = canvas.width;
        const gameHeight = canvas.height;
        
        let snake = [];
        let food = {};
        let dx = gridSize;
        let dy = 0;
        let nextDx = gridSize;
        let nextDy = 0;
        let gameInterval;
        let score = 0;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        let isPaused = false;
        let isGameOver = false;
        let gameSpeed = 100; // milliseconds
        
        // DOM elements
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('high-score');
        const finalScoreElement = document.getElementById('final-score');
        const gameOverElement = document.getElementById('game-over');
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const restartBtn = document.getElementById('restart-btn');
        
        // Update high score display
        highScoreElement.textContent = highScore;
        
        // Initialize game
        function init() {
            // Create snake
            snake = [
                { x: 5 * gridSize, y: 10 * gridSize },
                { x: 4 * gridSize, y: 10 * gridSize },
                { x: 3 * gridSize, y: 10 * gridSize }
            ];
            
            // Reset direction
            dx = gridSize;
            dy = 0;
            nextDx = gridSize;
            nextDy = 0;
            
            // Reset score
            score = 0;
            scoreElement.textContent = score;
            
            // Create food
            createFood();
            
            // Reset game state
            isGameOver = false;
            gameOverElement.classList.remove('active');
        }
        
        // Create food at random position
        function createFood() {
            const availablePositions = [];
            
            // Get all available positions (not occupied by snake)
            for (let x = 0; x < gameWidth; x += gridSize) {
                for (let y = 0; y < gameHeight; y += gridSize) {
                    const isOccupied = snake.some(segment => segment.x === x && segment.y === y);
                    if (!isOccupied) {
                        availablePositions.push({ x, y });
                    }
                }
            }
            
            // Select random position
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            food = availablePositions[randomIndex];
        }
        
        // Game loop
        function gameLoop() {
            if (isPaused || isGameOver) return;
            
            // Update snake position
            moveSnake();
            
            // Check collision
            if (checkCollision()) {
                gameOver();
                return;
            }
            
            // Check food consumption
            if (snake[0].x === food.x && snake[0].y === food.y) {
                // Increase score
                score++;
                scoreElement.textContent = score;
                
                // Check high score
                if (score > highScore) {
                    highScore = score;
                    highScoreElement.textContent = highScore;
                    localStorage.setItem('snakeHighScore', highScore);
                }
                
                // Create new food
                createFood();
                
                // Speed up game slightly
                if (score % 5 === 0 && gameSpeed > 60) {
                    gameSpeed -= 5;
                    clearInterval(gameInterval);
                    gameInterval = setInterval(gameLoop, gameSpeed);
                }
            } else {
                // Remove tail
                snake.pop();
            }
            
            // Draw game
            draw();
        }
        
        // Move snake
        function moveSnake() {
            // Apply next direction
            dx = nextDx;
            dy = nextDy;
            
            // Calculate new head position
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            
            // Handle wrapping around the edges
            if (head.x >= gameWidth) head.x = 0;
            if (head.x < 0) head.x = gameWidth - gridSize;
            if (head.y >= gameHeight) head.y = 0;
            if (head.y < 0) head.y = gameHeight - gridSize;
            
            // Add new head
            snake.unshift(head);
        }
        
        // Check collision with self
        function checkCollision() {
            const head = snake[0];
            
            // Check collision with self
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    return true;
                }
            }
            
            return false;
        }
        
        // Draw game
        function draw() {
            // Clear canvas
            ctx.clearRect(0, 0, gameWidth, gameHeight);
            
            // Draw grid (subtle)
            ctx.fillStyle = '#1e2a4a';
            for (let x = 0; x < gameWidth; x += gridSize) {
                for (let y = 0; y < gameHeight; y += gridSize) {
                    if ((x / gridSize + y / gridSize) % 2 === 0) {
                        ctx.fillRect(x, y, gridSize, gridSize);
                    }
                }
            }
            
            // Draw snake
            snake.forEach((segment, index) => {
                // Gradient color for snake
                let hue = 230 - index * (50 / snake.length);
                ctx.fillStyle = index === 0 ? '#4d54e0' : `hsl(${hue}, 80%, 60%)`;
                
                // Draw rounded rectangle for snake segments
                drawRoundedRect(segment.x, segment.y, gridSize, gridSize, index === 0 ? 8 : 5);
                
                // Draw eyes for head
                if (index === 0) {
                    ctx.fillStyle = '#fff';
                    // Position eyes based on direction
                    if (dx > 0) { // Right
                        ctx.fillRect(segment.x + gridSize - 7, segment.y + 5, 3, 3);
                        ctx.fillRect(segment.x + gridSize - 7, segment.y + gridSize - 8, 3, 3);
                    } else if (dx < 0) { // Left
                        ctx.fillRect(segment.x + 4, segment.y + 5, 3, 3);
                        ctx.fillRect(segment.x + 4, segment.y + gridSize - 8, 3, 3);
                    } else if (dy < 0) { // Up
                        ctx.fillRect(segment.x + 5, segment.y + 4, 3, 3);
                        ctx.fillRect(segment.x + gridSize - 8, segment.y + 4, 3, 3);
                    } else { // Down
                        ctx.fillRect(segment.x + 5, segment.y + gridSize - 7, 3, 3);
                        ctx.fillRect(segment.x + gridSize - 8, segment.y + gridSize - 7, 3, 3);
                    }
                }
            });
            
            // Draw food with glow effect
            ctx.shadowColor = 'rgba(0, 255, 170, 0.8)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#00ffaa';
            drawRoundedRect(food.x, food.y, gridSize, gridSize, 10);
            
            // Reset shadow
            ctx.shadowBlur = 0;
        }
        
        // Helper function to draw rounded rectangles
        function drawRoundedRect(x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        }
        
        // Handle keyboard input
        function handleKeyDown(e) {
            // Prevent arrow keys from scrolling the page
            if ([37, 38, 39, 40, 32].includes(e.keyCode)) {
                e.preventDefault();
            }
            
            // Change direction (and prevent 180° turns)
            switch (e.keyCode) {
                case 37: // Left
                    if (dx === 0) {
                        nextDx = -gridSize;
                        nextDy = 0;
                    }
                    break;
                case 38: // Up
                    if (dy === 0) {
                        nextDx = 0;
                        nextDy = -gridSize;
                    }
                    break;
                case 39: // Right
                    if (dx === 0) {
                        nextDx = gridSize;
                        nextDy = 0;
                    }
                    break;
                case 40: // Down
                    if (dy === 0) {
                        nextDx = 0;
                        nextDy = gridSize;
                    }
                    break;
                case 32: // Space (pause/resume)
                    togglePause();
                    break;
            }
        }
        
        // Start game
        function startGame() {
            if (gameInterval) clearInterval(gameInterval);
            init();
            gameSpeed = 100;
            gameInterval = setInterval(gameLoop, gameSpeed);
            startBtn.textContent = 'Restart Game';
            isPaused = false;
            pauseBtn.textContent = 'Pause';
        }
        
        // Toggle pause
        function togglePause() {
            if (isGameOver) return;
            
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
        }
        
        // Game over
        function gameOver() {
            isGameOver = true;
            finalScoreElement.textContent = score;
            gameOverElement.classList.add('active');
        }
        
        // Event listeners
        document.addEventListener('keydown', handleKeyDown);
        startBtn.addEventListener('click', startGame);
        pauseBtn.addEventListener('click', togglePause);
        restartBtn.addEventListener('click', startGame);
        
        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        canvas.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            e.preventDefault();
        }, { passive: false });
        
        canvas.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
        
        canvas.addEventListener('touchend', function(e) {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // Determine swipe direction based on which axis had the greater movement
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0 && dx === 0) { // Right swipe
                    nextDx = gridSize;
                    nextDy = 0;
                } else if (diffX < 0 && dx === 0) { // Left swipe
                    nextDx = -gridSize;
                    nextDy = 0;
                }
            } else {
                if (diffY > 0 && dy === 0) { // Down swipe
                    nextDx = 0;
                    nextDy = gridSize;
                } else if (diffY < 0 && dy === 0) { // Up swipe
                    nextDx = 0;
                    nextDy = -gridSize;
                }
            }
            
            e.preventDefault();
        }, { passive: false });
        
        // Initial draw
        draw();
        startGame();
