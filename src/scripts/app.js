const invoke = window.__TAURI__.core.invoke;

const MS_PER_UPDATE = 250

const MS_PER_SECOND = 1000.0
const SECONDS_PER_MINUTE = 60
const WORK_TIME = 0.2 * SECONDS_PER_MINUTE
const BREAK_TIME = 5 * SECONDS_PER_MINUTE

let timer = new Timer(0)
timer.isFinished = true

let isTimeForBreak = false
let startedSessions = 0
let completedSessions = 0

let currentInterval = null
function update() {
    timer.update()
}

function startNext() {
    if (isTimeForBreak) {
        start(BREAK_TIME)
        label.innerText = "Break"
        clock.classList.remove("paused")
    } else {
        start(WORK_TIME)
        label.innerText = "Work"
        clock.classList.remove("paused")
    }
    isTimeForBreak = !isTimeForBreak
}

function start(seconds) {
    if (currentInterval != null) {
        clearInterval(currentInterval)
    }

    timer = new Timer(seconds)

    update()
    currentInterval = setInterval(update, MS_PER_UPDATE)

    startedSessions += 1

    var audio = new Audio('/assets/sfx/select.mp3');
    audio.play();
}

function notify() {
    var audio = new Audio('/assets/sfx/good.mp3');
    audio.play();

    var audio = new Audio('/assets/sfx/retro-audio.mp3');
    audio.play();

    invoke("notify")
}

// EVENTS

document.addEventListener("onUpdated", onUpdate)
function onUpdate() {
    updateGUI()
}

document.addEventListener("onSkipped", onSkip)
function onSkip() {
    main.classList.remove("paused")

    updateGUI()
}

document.addEventListener("onCompleted", onComplete)
function onComplete() {
    completedSessions += 1
    notify()

    updateGUI()
}

document.addEventListener("onTogglePause", onPause)
function onPause() {
    if (timer.isPaused) {
        main.classList.add("paused")
    } else {
        main.classList.remove("paused")
    }

    updateGUI()
}

function togglePause() {
    timer.togglePause()

    var audio = new Audio('/assets/sfx/blip-select.mp3');
    audio.play();
}

function skip() {
    timer.skip()

    var audio = new Audio('/assets/sfx/blip-select.mp3');
    audio.play();
}

// GUI

let startBtn = document.getElementById("start-btn")
let skipBtn = document.getElementById("skip-btn")
let label = document.getElementById("label")
let clock = document.getElementById("clock")
let main = document.getElementById("main")

function updateGUI() {
    updateClockGUI()
    updateButtonsGUI()

    if (timer.isTimerOver()) {
        if (isTimeForBreak) {
            // label.innerText = "Next Up: Break"
        } else {
            // label.innerText = "Next Up: Work"
        }

        document.getElementById("label").innerText = ""
    }
}

function updateClockGUI() {
    let split = splitMinutesAndSeconds(timer.getSecondsRemaining())
    // let minutesString = convertToDoubleDigitString(split.minutes)
    let minutesString = split.minutes
    let secondsString = convertToDoubleDigitString(split.seconds)

    clock.textContent = `${minutesString}:${secondsString}`
}

function updateButtonsGUI() {
    if (!timer.isTimerOver()) {
        if (timer.isPaused) {
            startBtn.textContent = "Continue"
        } else {
            startBtn.textContent = "Pause"
        }
        startBtn.setAttribute("onclick", "togglePause()")
        skipBtn.disabled = false
    } else {
        if (isTimeForBreak) {
            startBtn.textContent = "Start Break"
        } else {
            startBtn.textContent = "Start Session"
        }
        startBtn.setAttribute("onclick", "startNext()")
        skipBtn.disabled = true
    }
}

// UTILITY FUNCTIONS

function splitMinutesAndSeconds(seconds) {
    let minutes = Math.floor(seconds / SECONDS_PER_MINUTE)
    seconds = seconds - (minutes * SECONDS_PER_MINUTE)

    return {
        "minutes": minutes,
        "seconds": seconds
    }
}

function convertToDoubleDigitString(number) {
    return number.toString().padStart(2, '0');
}