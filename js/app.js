// grab neccessary elements
const canvas = document.querySelector('#canvas')
const startButton = document.querySelector('#top-right')
const startText  = document.querySelector('#start')
const score = document.querySelector('#score')
const lives = document.querySelector('#lives')

// set canvas dimensions 960 x 540 + get context
const ctx = canvas.getContext('2d')
canvas.setAttribute('height', getComputedStyle(canvas)['height'])
canvas.setAttribute('width', getComputedStyle(canvas)['width'])

// DECLARE AND DEFINE GLOBAL VARIABLES
let currentFrame = 0
let currentScore = 0
let update = null
const images = {}
const imageReady = {}

loadAllImages()

// image loading -- make sure images are loaded before drawing
function loadImage(location, keyName) {
    imageReady[keyName] = false
    let img = new Image()
    img.src = `./assets/${location}`
    images[keyName] = img
    img.onload = () => {
        imageReady[keyName] = true
    }
}

// asset prep
function loadAllImages () {
    loadImage('waffle_dish.png', 'waffleDish')
    loadImage('dish.png', 'dish')
    loadImage('pancakes.png', 'pancakes')
    loadImage('pancakes_dish.png', 'pancakesDish')
    loadImage('bacon.png', 'bacon')
    loadImage('bacon_dish.png', 'baconDish')
    loadImage('omlet.png', 'omlet')
    loadImage('omlet_dish.png', 'omletDish')
}

class Object {
    constructor (x, y, width, height, speed, image, plated) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speed = speed
        this.image = image
        this.plated = plated
        this.alive = true
        this.hit = false
    }
    
    // FOR DEBUGGING
    // render() { 
    //     ctx.fillStyle = this.image
    //     ctx.fillRect(this.x, this.y, this. width, this.height)
    // }

    render() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
}

class PlayerChr extends Object {
    constructor (x, y, width, height, speed, image) {
        super(x, y, width, height, speed, image)
        this.life = 3
        this.livesLeft = ["Game Over!", "💖", "💖💖", "💖💖💖"]
    }
}

const waffle = new PlayerChr(50, 245, 64, 64, 25, images.waffleDish)
const bullets = []
const enemies = []

// player movement + shooting handler
function playerMovement(e) {
    if (waffle.alive){
        switch (e.key) {
            // UP
            case('ArrowUp'):
                // prevents scrolling the page
                e.preventDefault()
                waffle.y -= waffle.speed
                if (waffle.y < 0) {
                    waffle.y = 0
                }
                break
            // DOWN
            case('ArrowDown'):
                e.preventDefault()
                waffle.y += waffle.speed
                if (waffle.y + waffle.height > canvas.height) {
                    waffle.y = canvas.height - waffle.height
                }
                break
            // LEFT
            case('ArrowLeft'):
                e.preventDefault()
                waffle.x -= waffle.speed
                if (waffle.x < 0) {
                    waffle.x = 0
                }
                break
            // RIGHT
            case('ArrowRight'):
                e.preventDefault()
                waffle.x += waffle.speed
                if (waffle.x + waffle.width > canvas.width) {
                    waffle.x = canvas.width - waffle.width
                }
                break
            // SHOOT
            case(' '):
                e.preventDefault()
                bullets.push(new Object(waffle.x + waffle.width, waffle.y + waffle.height/3, 32, 32, 20, images.dish))
                break
            default: break
        }
    }
}

// bullet render and hit detection
function shootBullets() {
    // loop through all the bullets
    for (let i = 0; i < bullets.length; i++) {
        // if the bullet is live, render and move it
        if (bullets[i].alive) {
            bullets[i].render()
            bullets[i].x += bullets[i].speed
            // kill bullet when it reaches edge of canvas
            if (bullets[i].x > 960) {
                bullets[i].alive = false
            }
            // check for hit between bullet and enemies
            for (let j = 0; j < enemies.length; j++){
                if (enemies[j].alive) {
                    if (detectHit(bullets[i], enemies[j])) {
                        enemies[j].hit = true
                        enemies[j].speed = 0
                        enemies[j].image = enemies[j].plated
                        currentScore += 1000
                        score.innerText = `Score: ${currentScore}`
                        bullets[i].alive = false
                        enemies[j].alive = false
                        setTimeout(() => {
                            enemies[j].hit = false
                        }, 500)
                    }
                }
            }
        }
    }
}

// random number generator
function randomNum(max) {
    return Math.floor(Math.random() * max)
}

// enemy creation and placement
function newPancake() {
    let randomY = randomNum(460)
    // creates enemy at random y offscreen, creates faster enemeies after 30~ and 60~ seconds
    if (currentFrame > 1020) {
        enemies.push(new Object(960, randomY, 96, 96, randomNum(5) + 15, images.omlet, images.omletDish))
    } else if (currentFrame > 510) {
        enemies.push(new Object(960, randomY, 96, 96, randomNum(5) + 10, images.bacon, images.baconDish))
    } else {
        enemies.push(new Object(960, randomY, 96, 96, randomNum(5) + 5, images.pancakes, images.pancakesDish))
    }
}

function spawnPancakes() {
    // loop through all the enemies
    for (i = 0; i < enemies.length; i++){
        // if enemy is alive, render it and move it 
        if (enemies[i].alive || enemies[i].hit) {
            enemies[i].render()
            enemies[i].x -= enemies[i].speed
            // kill enemy when it reaches edge of canvas
            if (enemies[i].x < -99) {
                enemies[i].alive = false
            }
            // check for hit between enemy and player
            if (detectHit(enemies[i], waffle)){
                enemies[i].alive = false
                waffle.life--
                lives.innerText = waffle.livesLeft[waffle.life]
            }
        }
    }
}

// COLLISION DETECTION ALGO
function detectHit(objOne, objTwo) {
    const top = objOne.y + objOne.height >= objTwo.y
    const right = objOne.x <= objTwo.x + objTwo.width
    const bottom = objOne.y <= objTwo.y + objTwo.height
    const left = objOne.x + objOne.width >= objTwo.x
    if (top && right && bottom && left){
        return true
    } else {
        return false
    }
}

// gameplay loop
startButton.addEventListener('click', startGame, {once:true})

// initilize the game
function startGame() {
    waffle.x = 50
    waffle.y = 245
    currentScore = 0
    lives.innerText = "💖💖💖"
    startText.innerText = "Restart"
    startButton.addEventListener('click', gameOver, {once:true})
    update = setInterval(gameLoop, 60)
    document.addEventListener('keydown', playerMovement)
}

// what happens every frame
function gameLoop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (currentFrame % 100 === 0){
        newPancake()
    }
    currentFrame++
    waffle.render()
    spawnPancakes()
    shootBullets()
    if (waffle.life <= 0) {
        gameOver()
    }
}

// when its game over
function gameOver() {
    clearInterval(update)
    document.removeEventListener('keydown', playerMovement)
    gameState = 0
    while (bullets.length > 0) {
        bullets.pop()
    }
    while (enemies.length > 0) {
        enemies.pop()
    }
    startText.innerText = "Try again!"
    startButton.addEventListener('click', startGame, {once:true})
}