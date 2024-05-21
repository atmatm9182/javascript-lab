const timerElement = document.querySelector("#timer");
const gameWonTextElement = document.querySelector("#game-won-text");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const canvasHeight = canvas.height;
const canvasWidth = canvas.width;

const ballRadius = 25;
const holeRadius = ballRadius;

const ballState = {
    degreeX: 0, // [-90, 90]
    degreeY: 0, // [-180, 180]
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    radius: ballRadius,
    accelX: 0.5,
    accelY: 0.5,
};

const holeState = {
    x: 0,
    y: 0,
    radius: holeRadius,
};

const holeKinds = ["regular", "moving", "portal"];

let holes = new Array(5).fill(undefined).map((_) => structuredClone(holeState));

const accelerationPerDegree = 0.5;

let timerCounter = 0;

let appRunning;

startApp();

function startApp() {
    randomizeHoles();
    drawObjects();
    addEventListener("deviceorientation", orientationEventListener);
    requestAnimationFrame(singleFrameAction);
}

let startTime = undefined;

function singleFrameAction(timestamp) {
    if (!appRunning) {
        requestAnimationFrame(singleFrameAction);
        return;
    }

    updateBall();
    updateHoles();

    updateTimerCounter(timestamp);

    drawTimer();
    drawObjects();

    if (holes.length == 0) {
        appRunning = false;
        gameWonTextElement.textContent = `Congratulations! You won in ${timerCounter} seconds.`;
        return;
    }

    requestAnimationFrame(singleFrameAction);
}

function updateTimerCounter(timestamp) {
    startTime ??= timestamp;
    timerCounter = Math.floor((timestamp - startTime) / 1000);
}

function updateBall() {
    updateBallPosition();
    updateObjectAcceleration(ballState);
}

function updateHoles() {
    const newHoles = [];
    for (const hole of holes) {
        if (checkCollision(ballState, hole)) {
            onHoleCollision(ballState, hole);
            continue;
        }

        newHoles.push(hole);

        if (hole.kind == "moving") {
            updateMovingHole(hole);
        }
    }

    holes = newHoles;
}

function updateMovingHole(hole) {
    hole.x += hole.accelX;
    hole.y += hole.accelY;
    updateObjectAcceleration(hole);
}

function onHoleCollision(ballState, hole) {
    switch (hole.kind) {
        case "regular":
        case "moving":
            break;
        case "portal":
            ballState.x = hole.out.x;
            ballState.y = hole.out.y;
            break;
    }
}

function updateObjectAcceleration(obj) {
    if (
        obj.x - obj.radius <= 0 ||
        obj.x + obj.radius >= canvasWidth
    ) {
        obj.accelX = -obj.accelX;
    }

    if (
        obj.y - obj.radius <= 0 ||
        obj.y + obj.radius >= canvasHeight
    ) {
        obj.accelY = -obj.accelY;
    }
}

function updateBallPosition() {
    ballState.x += ballState.accelX * ballState.degreeX;
    ballState.y += ballState.accelY * (ballState.degreeY - 90);
}

function drawTimer() {
    timerElement.textContent = timerCounter;
}

function drawObjects() {
    ctx.reset();

    ctx.fillStyle = "red";
    ctx.beginPath();
    redrawBall();
    ctx.fill();

    redrawHoles();
}

function redrawBall() {
    ctx.arc(ballState.x, ballState.y, ballRadius, 0, 2 * Math.PI);
}

function redrawHole(hole) {
    switch (hole.kind) {
        case "regular":
            ctx.fillStyle = "black";
            break;
        case "moving":
            ctx.fillStyle = "purple";
            break;
        case "portal":
            ctx.fillStyle = "yellow";
            break;
        default:
            throw hole.kind;
    }

    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI);
    ctx.fill();
}

function redrawHoles() {
    for (const hole of holes) {
        redrawHole(hole);
    }
}

function orientationEventListener(e) {
    updateBallState(e);
    appRunning = appRunning === undefined ? false : true;
}

function updateBallState(e) {
    ballState.degreeY = e.beta;
    ballState.degreeX = e.gamma;
}

function clamp(x, min, max) {
    const y = min < x ? x : min;
    return y > max ? max : y;
}

function randomChoise(arr) {
    const idx = Math.round(Math.random() * (arr.length - 1));
    return arr[idx];
}

function checkCollision(obj1, obj2) {
    const collisionX =
        obj1.x + obj1.radius >= obj2.x - obj2.radius &&
        obj1.x - obj1.radius <= obj2.x + obj2.radius;
    const collisionY =
        obj1.y + obj1.radius >= obj2.y - obj2.radius &&
        obj1.y - obj1.radius <= obj2.y + obj2.radius;

    return collisionX && collisionY;
}

function randomizeHole(hole) {
    hole.x = clamp(
        Math.random() * canvasWidth,
        hole.radius,
        canvasWidth - hole.radius,
    );
    hole.y = clamp(
        Math.random() * canvasHeight,
        hole.radius,
        canvasHeight - hole.radius,
    );

    randomizeHoleKind(hole);
}

function randomizeHoleKind(hole) {
    hole.kind = randomChoise(holeKinds);

    switch (hole.kind) {
        case "moving":
            hole.accelX = clamp(Math.random() * 20, 10, 20);
            hole.accelY = clamp(Math.random() * 20, 10, 20);
            break;
        case "portal":
            hole.out = {
                x: clamp(
                    Math.random() * canvasWidth,
                    hole.radius,
                    canvasWidth - hole.radius,
                ),
                y: clamp(
                    Math.random() * canvasHeight,
                    hole.radius,
                    canvasHeight - hole.radius,
                ),
            };
            break;
    }
}

function randomizeHoles() {
    for (const hole of holes) {
        randomizeHole(hole);
    }
}
