const button = document.getElementById("myButton");
const canvas = document.getElementById("raceCanvas");
const ctx = canvas.getContext("2d");
const gameContainer = document.getElementById("gameContainer");
const scoreBoard = document.getElementById("scoreBoard");
const restartBtn = document.getElementById("restartBtn");

// Настройки игры
let score = 0;
let gameActive = false;
let player = { x: 175, y: 500, w: 40, h: 70 }; // Чуть уменьшил размер для лучшего геймплея
let enemies = [];
let enemySpeed = 5;

// Управление
let keys = {};
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

// Функция создания врага
function spawnEnemy() {
    const x = Math.random() * (canvas.width - 40);
    enemies.push({ x: x, y: -100, w: 40, h: 70 });
}

// Красивая отрисовка болида (без картинок, только код)
function drawF1Car(x, y, width, height, color, isPlayer) {
    // 1. Колеса (черные)
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(x - 6, y + 10, 10, 16); // Переднее левое
    ctx.fillRect(x + width - 4, y + 10, 10, 16); // Переднее правое
    ctx.fillRect(x - 8, y + height - 25, 12, 20); // Заднее левое
    ctx.fillRect(x + width - 4, y + height - 25, 12, 20); // Заднее правое

    // 2. Переднее антикрыло
    ctx.fillStyle = "#333";
    ctx.fillRect(x - 2, y + 2, width + 4, 6);

    // 3. Корпус
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, y + height);
    ctx.lineTo(x + width * 0.8, y + height);
    ctx.lineTo(x + width * 0.65, y);
    ctx.lineTo(x + width * 0.35, y);
    ctx.closePath();
    ctx.fill();

    // 4. Заднее антикрыло
    ctx.fillStyle = color;
    ctx.fillRect(x, y + height - 8, width, 10);
    ctx.fillStyle = "#111"; 
    ctx.fillRect(x - 2, y + height - 4, width + 4, 4);

    // 5. Кокпит (Halo)
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.45, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // Камера сверху
    ctx.fillStyle = isPlayer ? "#ff0" : "#555"; 
    ctx.fillRect(x + width / 2 - 5, y + height * 0.5, 10, 3);
}

function update() {
    if (!gameActive) return;

    // Движение игрока
    if (keys["ArrowLeft"] && player.x > 10) player.x -= 7;
    if (keys["ArrowRight"] && player.x < canvas.width - player.w - 10) player.x += 7;

    // Движение врагов
    enemies.forEach((enemy, index) => {
        enemy.y += enemySpeed;

        // Проверка столкновения
        if (player.x < enemy.x + enemy.w &&
            player.x + player.w > enemy.x &&
            player.y < enemy.y + enemy.h &&
            player.y + player.h > enemy.y) {
            gameOver();
        }

        // Удаление и счет
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            score++;
            scoreBoard.innerText = `Счёт: ${score}`;
            if (score % 5 === 0) enemySpeed += 0.5;
        }
    });

    if (Math.random() < 0.02) spawnEnemy();
}

function draw() {
    // Фон асфальта
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Разметка дороги
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.setLineDash([30, 30]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Отрисовка машин
    drawF1Car(player.x, player.y, player.w, player.h, "#e10600", true);
    enemies.forEach(enemy => {
        drawF1Car(enemy.x, enemy.y, enemy.w, enemy.h, "#ffffff", false);
    });
}

function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameActive = false;
    
    const engineSound = document.getElementById("engineSound");
    if(engineSound) engineSound.pause();

    if (restartBtn && scoreBoard) {
        // Показываем кнопку РЕСТАРТ прямо под счётом
        restartBtn.style.display = "inline-block"; 
        scoreBoard.innerText = "ФИНАЛЬНЫЙ СЧЁТ: " + score;
        scoreBoard.style.color = "white";
    }
}

// Запуск игры
button.addEventListener("click", () => {
    document.querySelector(".action-zone").style.display = "none"; 
    gameContainer.style.display = "flex"; 
    gameActive = true;
    
    const engineSound = document.getElementById("engineSound");
    if(engineSound) {
        engineSound.currentTime = 0;
        engineSound.play();
    }

    gameLoop();
});
// Добавляем поддержку управления тапами (нажать слева/справа от центра)
canvas.addEventListener("touchstart", (e) => {
    const touchX = e.touches[0].clientX;
    if (touchX < window.innerWidth / 2) {
        keys["ArrowLeft"] = true;
    } else {
        keys["ArrowRight"] = true;
    }
});

canvas.addEventListener("touchend", () => {
    keys["ArrowLeft"] = false;
    keys["ArrowRight"] = false;
});