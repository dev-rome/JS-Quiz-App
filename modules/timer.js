let timerId = null;
let timeLeft = 15;

export function startTimer(onComplete, onTick) {
    stopTimer();
    timeLeft = 15;
    if (onTick) {
        onTick(timeLeft);
    }
    timerId = setInterval(() => {
        timeLeft--;
        if (onTick) {
            onTick(timeLeft);
        }
        if (timeLeft <= 0) {
            stopTimer();
            onComplete();
        }
    }, 1000);
}

export function stopTimer() {
    clearInterval(timerId);
}