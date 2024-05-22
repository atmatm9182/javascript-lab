class Vector2 {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @param {Vector2} other
     */
    add(other) {
        this.x += other.x;
        this.y += other.y;
    }

    /**
     * @param {Vector2} v1
     * @param {Vector2} v2
     * @returns {number}
     */
    static distance(v1, v2) {
        const s1 = Math.pow(v2.y - v1.y, 2);
        const s2 = Math.pow(v2.x - v1.x, 2);
        return Math.sqrt(s1 + s2);
    }

    /**
     * @param {number} x
     * @returns {Vector2}
     */
    static unit(x) {
        return new Vector2(x, x);
    }
}

/**
 * Represents a moving object that has a position and acceleration
 */
class Entity {
    /**
     * @param {Vector2} position
     * @param {Vector2} acceleration
     * @param {Vector2} size
     */
    constructor(position, acceleration, size) {
        this.position = position;
        this.acceleration = acceleration;
        this.size = size;
    }
}

/**
 * @extends Entity
 */
class Ball extends Entity {
    /**
     * @param {Vector2} position
     * @param {Vector2} acceleration
     * @param {number} radius
     * @param {number} thickness
     */
    constructor(position, acceleration, radius, thickness) {
        const size = Vector2.unit(radius);
        super(position, acceleration, size);

        this.radius = radius;
        this.thickness = thickness;
    }

    /**
     * @returns {Ball}
     */
    static random() {
        const radius = randomNumberRange(10, 20);
        const position = new Vector2(
            randomNumberRange(radius, canvasWidth - radius),
            randomNumberRange(radius, canvasHeight - radius),
        );
        const acceleration = new Vector2(
            randomNumberRange(-10, 10),
            randomNumberRange(-10, 10),
        );
        const thickness = randomNumberRange(4, 8);

        return new Ball(position, acceleration, radius, thickness);
    }
}

const canvas = getCanvas();
const ctx = getCanvasContext(canvas);

const [lineLengthInput, ballsCountInput] = getInputs();

const canvasHeight = canvas.height;
const canvasWidth = canvas.width;

let defaultLineLength =
    (canvasWidth * Number.parseFloat(lineLengthInput.value)) / 100;

const originalBallsCount = Number.parseInt(ballsCountInput.value);

const originalBallsState = new Array(originalBallsCount)
    .fill(undefined)
    .map((_) => Ball.random());
const balls = structuredClone(originalBallsState);

startApp();

function startApp() {
    addControlEventListeners();
    drawBalls();
    requestAnimationFrame(singleFrameAction);
}

let lastFrameTimestamp = Date.now();
let appRunning = false;

let lastFrameCounterUpdate = -1000;

function addControlEventListeners() {
    addControlInputsEvenetListeners();
    addControlButtonsEventListeners();
}

/**
 * @param {number} timestamp
 */
function singleFrameAction(timestamp) {
    if (timestamp - lastFrameCounterUpdate >= 500) {
        lastFrameCounterUpdate = timestamp;
        updateFrameCounter(timestamp);
    }

    if (!appRunning) {
        requestAnimationFrame(singleFrameAction);
        return;
    }

    updateBalls();
    drawBalls();

    lastFrameTimestamp = timestamp;
    requestAnimationFrame(singleFrameAction);
}

function updateBalls() {
    for (const ball of balls) {
        updateMovingBall(ball);
    }
}

/** @param {Ball} ball */
function updateMovingBall(ball) {
    ball.position.x += ball.acceleration.x;
    ball.position.y += ball.acceleration.y;
    updateBallAcceleration(ball);
}

/** @param {Ball} ball */
function updateBallAcceleration(ball) {
    if (
        ball.position.x - ball.radius <= 0 ||
        ball.position.x + ball.radius >= canvasWidth
    ) {
        ball.acceleration.x = -ball.acceleration.x;
    }

    if (
        ball.position.y - ball.radius <= 0 ||
        ball.position.y + ball.radius >= canvasHeight
    ) {
        ball.acceleration.y = -ball.acceleration.y;
    }
}

function drawBalls() {
    ctx.reset();
    for (let i = 0; i < balls.length; i++) {
        const ball1 = balls[i];
        drawBall(ball1);

        for (let j = 0; j < balls.length; j++) {
            if (i == j) {
                continue;
            }

            const ball2 = balls[j];
            drawLineIfCloseEnough(ball1, ball2, defaultLineLength);
        }
    }
}

/**
 * @param {Ball} ball
 */
function drawBall(ball) {
    ctx.lineWidth = ball.thickness;
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, 2 * Math.PI);
    ctx.stroke();
}

/**
 * @param {number} x
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(x, min, max) {
    const y = min < x ? x : min;
    return y > max ? max : y;
}

/**
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
function randomChoise(arr) {
    const idx = Math.round(Math.random() * (arr.length - 1));
    return arr[idx];
}

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomNumberRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * @param {Ball} ball1
 * @param {Ball} ball2
 * @param {number} distance
 */
function drawLineIfCloseEnough(ball1, ball2, distance) {
    const d = Vector2.distance(ball1.position, ball2.position);

    if (d <= distance) {
        ctx.lineWidth = 4;
        ctx.moveTo(ball1.position.x, ball1.position.y);
        ctx.lineTo(ball2.position.x, ball2.position.y);
        ctx.stroke();
    }
}

/** @param {number} timestamp */
function updateFrameCounter(timestamp) {
    const frameCounter = document.querySelector("#frame-counter");
    if (!frameCounter) {
        throw new Error("could not get the frame counter");
    }

    const delta = timestamp - lastFrameTimestamp;
    const fps = Math.round(1000 / delta);
    frameCounter.textContent = fps.toString();
    lastFrameTimestamp = timestamp;
}

function addControlInputsEvenetListeners() {
    lineLengthInput.addEventListener("input", lineLengthInputEventListener);
    ballsCountInput.addEventListener("input", ballsCountInputEventListener);
}

/**
 * @param {Event} e
 */
function lineLengthInputEventListener(e) {
    const percentage = Number.parseFloat(lineLengthInput.value) / 100;
    defaultLineLength = canvasWidth * percentage;
}

/**
 * @param {Event} e
 */
function ballsCountInputEventListener(e) {
    if (appRunning) {
        return;
    }

    const ballsCount = Number.parseInt(ballsCountInput.value);
    const delta = ballsCount - balls.length;

    if (delta > 0) {
        for (let i = 0; i < delta; i++) {
            const ball = Ball.random();
            balls.push(ball);
            originalBallsState.push(structuredClone(ball));
        }
        return;
    }

    for (let i = delta; i < 0; i++) {
        balls.pop();
        originalBallsState.pop();
    }
}

function addControlButtonsEventListeners() {
    const startButton = document.querySelector("#start-button");
    if (!startButton) {
        throw new Error("could not get the start button");
    }

    const resetButton = document.querySelector("#reset-button");
    if (!resetButton) {
        throw new Error("could not get the reset button");
    }

    startButton.addEventListener("click", startButtonEventListener);
    resetButton.addEventListener("click", resetButtonEventListener);
}

/**
 * @param {Event} _e
 */
function startButtonEventListener(_e) {
    appRunning = !appRunning;
}

/**
 * @param {Event} _e
 */
function resetButtonEventListener(_e) {
    for (let i = 0; i < balls.length; i++) {
        balls[i] = structuredClone(originalBallsState[i]);
    }

    drawBalls();
}

/**
 * @returns {HTMLCanvasElement}
 */
function getCanvas() {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
        throw new Error("could not get the canvas");
    }
    return canvas;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {CanvasRenderingContext2D}
 */
function getCanvasContext(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("could not get the canvas 2d context");
    }
    return ctx;
}

/**
 * @returns {[HTMLInputElement, HTMLInputElement]}
 */
function getInputs() {
    /** @type {HTMLInputElement | null} */
    const lineInput = document.querySelector("input[name=line-length]");
    if (!lineInput) {
        throw new Error("could not get the line length input element");
    }

    /** @type {HTMLInputElement | null} */
    const ballInput = document.querySelector("input[name=balls-count]");
    if (!ballInput) {
        throw new Error("could not get the balls count input element");
    }

    return [lineInput, ballInput];
}
