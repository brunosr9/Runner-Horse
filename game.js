const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const winScreen = document.getElementById('win-screen');
const restartButton = document.getElementById('restart-button');
const winRestartButton = document.getElementById('win-restart-button');

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.6;
const INITIAL_SPEED = 6;
const SPEED_INCREMENT = 0.1;
const HORSE_WIDTH = 80;
const HORSE_HEIGHT = 60;
const WIN_SCORE = 500;

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

const horseDuckImage = new Image();
horseDuckImage.src = 'assets/horse_duck.png';

const treeImage = new Image();
treeImage.src = 'assets/tree.png';

const birdImage = new Image();
birdImage.src = 'assets/bird.png';

const backgroundImage = new Image();
backgroundImage.src = 'assets/background.png';

let bgX = 0;

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

    // Animation properties
    frameX: 0,
    frameY: 0,
    maxFrames: 4, // Supondo 4 frames horizontais na folha
    animationTimer: 0,
    animationSpeed: 5, // Troca a cada 5 frames do jogo (aprox 12 FPS)

    update() {
        // Gravity logic
        if (this.isJumping) {
            this.velocityY += GRAVITY;
            this.y += this.velocityY;

            const groundY = CANVAS_HEIGHT - this.height - 20;
            if (this.y > groundY) {
                this.y = groundY;
                this.velocityY = 0;
                this.isJumping = false;
            }
        }

        // Animation logic
        if (isGameRunning && !this.isJumping) {
            this.animationTimer++;
            if (this.animationTimer >= this.animationSpeed) {
                this.frameX = (this.frameX + 1) % this.maxFrames;
                this.animationTimer = 0;
            }
        } else if (this.isJumping) {
            this.frameX = 1; // Frame de pulo
        }
    },

    draw() {
        if (horseImage.complete) {
            ctx.save();

            let bobbing = 0;
            let stretchX = 1;
            let stretchY = 1;

            if (isGameRunning && !this.isJumping) {
                // Efeito de galope (procedural)
                bobbing = Math.sin(frameCount * 0.3) * 6;
                stretchX = 1 + Math.sin(frameCount * 0.3) * 0.05;
                stretchY = 1 - Math.sin(frameCount * 0.3) * 0.05;
            }

            const sW = horseImage.width;
            const sH = horseImage.height;
            const aspectRatio = sW / sH;
            const displayWidth = this.height * aspectRatio;

            // Aplica as transformações de animação
            ctx.translate(this.x, this.y + bobbing);
            ctx.scale(stretchX, stretchY);

            ctx.drawImage(
                horseImage,
                0, 0, sW, sH,
                0, 0, displayWidth, this.height
            );

            ctx.restore();
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
    const type = Math.random() > 0.3 ? 'tree' : 'bird';
    let obstacle = {
        x: CANVAS_WIDTH,
        y: 0,
        width: 0,
        height: 0,
        type: type,
        speed: gameSpeed
    };

    if (type === 'tree') {
        obstacle.width = 60;
        obstacle.height = 80;
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
        let img = obs.type === 'tree' ? treeImage : birdImage;
        if (img.complete) {
            ctx.save();
            if (obs.type === 'bird') {
                const sW = img.width;
                const sH = img.height;
                const aspectRatio = sW / sH;
                const displayWidth = obs.height * aspectRatio;

                // Efeito de bater asas (scaling vertical procedural)
                const wingFlap = 1 + Math.sin(frameCount * 0.5) * 0.3;

                ctx.translate(obs.x, obs.y + (obs.height * (1 - wingFlap)) / 2);
                ctx.scale(1, wingFlap);
                ctx.drawImage(img, 0, 0, sW, sH, 0, 0, displayWidth, obs.height);
            } else {
                // Árvore
                const aspectRatio = img.width / img.height;
                const displayWidth = obs.height * aspectRatio;
                ctx.drawImage(img, obs.x, obs.y, displayWidth, obs.height);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = obs.type === 'bird' ? '#2196F3' : '#2E7D32';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
    });
}

function updateScore() {
    frameCount++;
    if (frameCount % 10 === 0) {
        score++;
        scoreElement.innerText = score;

        // Check win condition
        if (score >= WIN_SCORE) {
            winGame();
        }

        // Increase difficulty
        if (score % 100 === 0) {
            gameSpeed += SPEED_INCREMENT;
        }
    }
}

function gameLoop() {
    if (!isGameRunning) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background (paralaxe suave)
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, bgX, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(backgroundImage, bgX + CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (isGameRunning) {
            bgX -= gameSpeed * 0.5;
            if (bgX <= -CANVAS_WIDTH) bgX = 0;
        }
    } else {
        // Fallback para quando a imagem não carregou
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);
    }

    // Draw ground line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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
    winScreen.classList.add('hidden');
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

function winGame() {
    isGameRunning = false;
    winScreen.classList.remove('hidden');
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
winRestartButton.addEventListener('click', startGame);
