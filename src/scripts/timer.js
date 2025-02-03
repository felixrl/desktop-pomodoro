const onTogglePause = new Event("onTogglePause");
const onCompleted = new Event("onCompleted");
const onSkipped = new Event("onSkipped");
const onUpdated = new Event("onUpdated");

class Timer {
    // Creates a new unpaused timer with duration and no elapsed time
    constructor(seconds) {
        this.duration = seconds
        this.timeElapsed = 0.0
        this.isPaused = false
        this.isFinished = false

        this.previousTime = Date.now() // Time since 1970
    }

    update() {
        if (this.isPaused || this.isFinished) { // Terminate early
            return
        }

        let delta = this.getDeltaMS()

        this.addTimeElapsed(delta / MS_PER_SECOND)

        document.dispatchEvent(onUpdated)

        if (this.isTimerOver()) {
            this.isFinished = true
            document.dispatchEvent(onCompleted)
        }
    }

    addTimeElapsed(seconds) {
        this.timeElapsed += seconds
        if (this.timeElapsed > this.duration) {
            this.timeElapsed = this.duration
        }
    }

    togglePause() {
        if (this.isPaused) {
            this.previousTime = Date.now()
            this.isPaused = false
        } else {
            this.isPaused = true
        }
        document.dispatchEvent(onTogglePause)
    }

    skip() {
        if (this.isTimerOver()) {
            return
        }

        this.timeElapsed = this.duration
        this.isFinished = true
        document.dispatchEvent(onSkipped)
    }

    getDeltaMS() {
        let currentTime = Date.now()
        let deltaMS = currentTime - this.previousTime // Delta time in MS
        this.previousTime = currentTime
        return deltaMS
    }

    // Rounded...
    getSecondsRemaining() {
        return Math.ceil(this.duration - this.timeElapsed)
    }

    isTimerOver() {
        return this.timeElapsed >= this.duration
    }
}