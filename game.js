const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const restartButton = document.getElementById('restart-button');

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.6;
const INITIAL_SPEED = 6;
const SPEED_INCREMENT = 0.1;
const HORSE_WIDTH = 80;
const HORSE_HEIGHT = 60;

// Set canvas dimensions
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let isGameRunning = false;
let score = 0;
let highScore = localStorage.getItem('horseRunnerHighScore') || 0;
let gameSpeed = INITIAL_SPEED;
let frameCount = 0;

highScoreElement.innerText = highScore;

// Assets loading
const horseImage = new Image();
horseImage.src = 'assets/horse.png';

const cactusImage = new Image();
cactusImage.src = 'assets/cactus.png';

const birdImage = new Image();
birdImage.src = 'assets/bird.png';

// Game object state
const horse = {
    x: 100,
    y: CANVAS_HEIGHT - HORSE_HEIGHT - 20,
    width: HORSE_WIDTH,
    height: HORSE_HEIGHT,
    color: '#FF3D00',
    velocityY: 0,
    isJumping: false,
    isCrouching: false,
    frame: 0,

    update() {
        // Gravity
        if (this.isJumping) {
            this.velocityY += GRAVITY;
            this.y += this.velocityY;

            // Ground collision
            const groundY = CANVAS_HEIGHT - this.height - 20;
            if (this.y > groundY) {
                this.y = groundY;
                this.velocityY = 0;
                this.isJumping = false;
            }
        }
    },

    draw() {
        if (horseImage.complete) {
            ctx.drawImage(horseImage, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    },

    jump() {
        if (!this.isJumping) {
            this.velocityY = -15;
            this.isJumping = true;
        }
    },

    crouch(crouching) {
        if (crouching && !this.isJumping) {
            this.isCrouching = true;
            this.height = HORSE_HEIGHT / 2;
            this.y = CANVAS_HEIGHT - this.height - 20;
        } else if (!crouching) {
            this.isCrouching = false;
            this.height = HORSE_HEIGHT;
            this.y = CANVAS_HEIGHT - this.height - 20;
        }
    }
};

let obstacles = [];

function spawnObstacle() {
    const type = Math.random() > 0.3 ? 'cactus' : 'bird';
    let obstacle = {
        x: CANVAS_WIDTH,
        y: 0,
        width: 0,
        height: 0,
        type: type,
        speed: gameSpeed
    };

    if (type === 'cactus') {
        obstacle.width = 40;
        obstacle.height = 50;
        obstacle.y = CANVAS_HEIGHT - obstacle.height - 20;
    } else {
        obstacle.width = 40;
        obstacle.height = 30;
        obstacle.y = CANVAS_HEIGHT - 100 - Math.random() * 100;
    }

    obstacles.push(obstacle);
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;

        // Check collision
        if (checkCollision(horse, obstacles[i])) {
            gameOver();
        }

        // Remove off-screen obstacles
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function drawObstacles() {
    obstacles.forEach(obs => {
        let img = obs.type === 'cactus' ? cactusImage : birdImage;
        if (img.complete) {
            ctx.drawImage(img, obs.x, obs.y, obs.width, obs.height);
        } else {
            ctx.fillStyle = obs.type === 'bird' ? '#2196F3' : '#4CAF50';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
    });
}

function updateScore() {
    frameCount++;
    if (frameCount % 10 === 0) {
        score++;
        scoreElement.innerText = score;

        // Increase difficulty
        if (score % 100 === 0) {
            gameSpeed += SPEED_INCREMENT;
        }
    }
}

function gameLoop() {
    if (!isGameRunning) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 20);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 20);
    ctx.stroke();

    horse.update();
    horse.draw();

    if (frameCount % 100 === 0) {
        spawnObstacle();
    }

    updateObstacles();
    drawObstacles();
    updateScore();

    requestAnimationFrame(gameLoop);
}

function startGame() {
    isGameRunning = true;
    score = 0;
    gameSpeed = INITIAL_SPEED;
    obstacles = [];
    frameCount = 0;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameLoop();
}

function gameOver() {
    isGameRunning = false;
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.innerText = score;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('horseRunnerHighScore', highScore);
        highScoreElement.innerText = highScore;
    }
}

// Input handling
window.addEventListener('keydown', (e) => {
    if (!isGameRunning && e.code === 'Space') {
        startGame();
    }

    if (isGameRunning) {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            horse.jump();
            e.preventDefault();
        }
        if (e.code === 'ArrowDown') {
            horse.crouch(true);
            e.preventDefault();
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown') {
        horse.crouch(false);
    }
});

restartButton.addEventListener('click', startGame);
