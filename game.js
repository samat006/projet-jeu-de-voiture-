// Initialisation du canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Définir la taille du canvas
canvas.width = 800; // Largeur fixe du canvas
canvas.height = 600; // Hauteur fixe du canvas

// Charger les images
const carImg = new Image();
const backgroundImg = new Image();
const obstacleImages = [
    './images/Ambulance.png', // Image de voiture 1
    './images/Black_viper.png', // Image de voiture 2
    './images/Mini_truck.png', 
    './images/Mini_van.png ',
    './images/Police.png',
    './images/taxi.png',
    './images/truck.png'
    // Image de voiture 3
];

let obstacles = [];
let carSpeed = 5;
let isGameOver = false;
let score = 0;  // Initialisation du score

// Charger les images avec les événements `onload`
carImg.src = './images/Audi.png'; // Image de la voiture du joueur
backgroundImg.src = './images/route.png'; // Image de fond

// Variables du jeu
let carX = canvas.width / 2 - 50;
let carY = canvas.height - 100;
let moveLeft = false;
let moveRight = false;
let backgroundY = 0;
let obstacleSpeed = 5;
let obstacleInterval = 2000; // Temps initial pour générer un obstacle (en ms)
let obstacleIntervalID;
let carAnimationPhase = 0; // Phase pour l'animation (oscillation)
// Variables pour l'animation de rotation
let carRotation = 0; // Angle de rotation actuel (en radians)
const maxRotation = 0.2; // Rotation maximale (en radians)
// Variables audio
const backgroundMusic = document.getElementById('backgroundMusic');
const crashSound = new Audio('./son/accident.ogg');
const moveSound = new Audio('./son/loop_5.wav');

// Démarrer la musique de fond lorsque le jeu commence
function startBackgroundMusic() {
    backgroundMusic.play(); // Joue la musique de fond en boucle
}

// Arrêter la musique de fond
function stopBackgroundMusic() {
    backgroundMusic.pause(); // Arrête la musique de fond
}

// Jouer le son de collision
function playCrashSound() {
    crashSound.play();
    moveSound.pause()
}

// Jouer un son de move
function playMoveSound() {
    moveSound.loop = true; // Activer la lecture en boucle
    moveSound.play(); // Démarrer le son
    
}



// Fonction pour dessiner la voiture du joueur avec rotation
function drawCar() {
    // Calculer l'angle de rotation en fonction du mouvement
    if (moveLeft && carRotation > -maxRotation) {
        carRotation -= 0.05; // Inclinaison à gauche
    } else if (moveRight && carRotation < maxRotation) {
        carRotation += 0.05; // Inclinaison à droite
    } else {
        // Revenir progressivement à la position neutre
        carRotation *= 0.9;
    }

    // Sauvegarder l'état du contexte
    ctx.save();

    // Appliquer une transformation pour centrer la rotation sur la voiture
    const carCenterX = carX + 40; // Position X du centre de la voiture
    const carCenterY = carY + 40; // Position Y du centre de la voiture

    ctx.translate(carCenterX, carCenterY); // Déplacer le contexte au centre de la voiture
    ctx.rotate(carRotation); // Appliquer la rotation
    ctx.translate(-carCenterX, -carCenterY); // Ramener le contexte à l'origine

    // Dessiner la voiture
    ctx.drawImage(carImg, carX, carY, 100, 100);

    // Restaurer l'état du contexte
    ctx.restore();
}



// Fonction pour dessiner un obstacle (voiture)
function drawObstacle(obstacle) {
    // Dessiner l'obstacle à sa position avec une taille de 80x80 (peut être ajusté)
    ctx.drawImage(obstacle.img, obstacle.x, obstacle.y, 100, 100);
}

// Fonction pour dessiner le fond
function drawBackground() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

// Détecter les touches pour déplacer la voiture
document.addEventListener('keydown', (e) => {
    if (e.key === "ArrowLeft") {
        moveLeft = true;
    }
    if (e.key === "ArrowRight") {
        moveRight = true;
}});

document.addEventListener('keyup', (e) => {
    if (e.key === "ArrowLeft") {
        moveLeft = false;
    }
    if (e.key === "ArrowRight") {
        moveRight = false;
    }
});

function drawBackground() {
    // Dessiner la route en mouvement, en répétant l'image de fond
    ctx.drawImage(backgroundImg, 0, backgroundY, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, backgroundY - canvas.height, canvas.width, canvas.height); // L'image du fond se répète

    // Animer le fond
    backgroundY += obstacleSpeed; // On fait défiler la route vers le bas

    // Si l'image a défilé complètement, on la réinitialise en haut
    if (backgroundY >= canvas.height) {
        backgroundY = 0;
    }
}


// Fonction pour générer des obstacles (voitures choisies au hasard)
const MIN_OBSTACLE_DISTANCE = 150; // Distance minimale entre deux obstacles (pixels)

function generateObstacle() {
    const x = Math.random() * (canvas.width - 80);
    const y = -100; // Position initiale en haut de l'écran
    const randomCar = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
    const img = new Image();
    img.src = randomCar;

    img.onload = function () {
        // Vérifier que le nouvel obstacle respecte la distance minimale
        for (let i = 0; i < obstacles.length; i++) {
            const other = obstacles[i];
            if (
                Math.abs(y - other.y) < MIN_OBSTACLE_DISTANCE && // Trop proche verticalement
                Math.abs(x - other.x) < 80                     // Trop proche horizontalement
            ) {
                return; // Annuler la création de cet obstacle
            }
        }
        // Ajouter l'obstacle s'il respecte les distances
        obstacles.push({ x, y, img });
    };
}


// Fonction pour mettre à jour la position des obstacles
function updateObstacles() {
     // Augmenter la vitesse des obstacles en fonction du score
    obstacleSpeed = 5 + Math.floor(score / 2);  // Chaque 5 points, on augmente la vitesse des obstacles

    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += 5; // Faire descendre l'obstacle
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1); // Retirer l'obstacle quand il est hors de l'écran
            score++; // Augmenter le score quand un obstacle sort de l'écran
            i--;
        }
    }
}

// Fonction pour ajuster la fréquence des obstacles en fonction du score
function adjustObstacleFrequency() {
    if (obstacleInterval > 500) { // Limiter à un intervalle minimal de 500ms
        obstacleInterval = 2000 - Math.min(1500, Math.floor(score * 100)); // Réduire progressivement avec le score
        clearInterval(obstacleIntervalID); // Réinitialiser l'intervalle
        obstacleIntervalID = setInterval(generateObstacle, obstacleInterval); // Régénérer avec le nouvel intervalle
    }
}

// Fonction de collision
function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        // Vérification de la collision en utilisant la taille des images
        if (
            carX < obstacle.x + 50 &&  // Taille de la voiture (ajustée à 80)
            carX + 50 > obstacle.x &&
            carY < obstacle.y + 50 &&  // Taille de l'obstacle (ajustée à 80)
            carY + 50 > obstacle.y
        ) {
            isGameOver = true;
        }
    }
}

// Fonction pour afficher le score
function drawScore() {
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = `Score: ${score}`;
}


// Fonction pour afficher le message "Game Over"
function displayGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "50px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Game Over!", canvas.width / 2 - 150, canvas.height / 2 - 30);
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2 - 75, canvas.height / 2 + 30);

    // Afficher la question pour recommencer
    ctx.font = "20px Arial";
    ctx.fillText("Appuyez sur 'R' pour recommencer ou 'Q' pour quitter", canvas.width / 2 - 200, canvas.height / 2 + 70);
    
}
//reset le jeu
function resetGame() {
    carX = canvas.width / 2 - 50; // Position initiale de la voiture
    carY = canvas.height - 100;
    obstacles = []; // Réinitialiser les obstacles
    score = 0; // Réinitialiser le score
    isGameOver = false; // Réinitialiser l'état de fin du jeu
    obstacleSpeed = 5; // Réinitialiser la vitesse des obstacles
    gameInterval = setInterval(gameLoop, 1000 / 60); // Redémarrer la boucle du jeu
}

// Fonction principale du jeu
function gameLoop() {
    if (isGameOver) {
        playCrashSound();
        clearInterval(gameInterval);
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", canvas.width / 2 - 100, canvas.height / 2);
        displayGameOver();
      
        document.addEventListener('keydown', (e) => {
            if (isGameOver) {
                if (e.key === 'r' || e.key === 'R') {
                    resetGame(); // Réinitialiser le jeu
                }
                if (e.key === 'q' || e.key === 'Q') {
                    window.location.reload(); // Recharger la page pour quitter
                }}})
        return;
         }
    playMoveSound()
    drawBackground();
    drawBackground();
    drawCar();
    updateObstacles();
    adjustObstacleFrequency();
    for (let i = 0; i < obstacles.length; i++) {
        drawObstacle(obstacles[i]);
    }
    checkCollision();
    drawScore();  // Afficher le score

    if (moveLeft && carX > 0) {
        carX -= carSpeed;
    }
    if (moveRight && carX < canvas.width - 80) {  // Ajuster selon la taille de la voiture
        carX += carSpeed;
    }
}

// Générer des obstacles toutes les 2 secondes
setInterval(generateObstacle, 2000);

// Initialiser le jeu avec la musique
startBackgroundMusic();



// Démarrer le jeu
let gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
