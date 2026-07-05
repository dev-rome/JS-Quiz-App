"use strict";

// --- State ---
const quizConfig = { category: null, difficulty: null, amount: null };

// --- Elements ---
const stepsContainer = document.querySelector(".steps");
const stepHint = document.querySelector(".intro p");

// hint text per step
const hints = {
    1: "Choose a difficulty.",
    2: "How many questions?",
    3: "Starting your quiz...",
};

// --- Event delegation on the steps container ---
stepsContainer.addEventListener("click", (event) => {
    const card = event.target.closest(".choice-card");
    if (!card) return;

    const currentStepEl = card.closest(".step");
    const stepNum = Number(currentStepEl.dataset.step);
    const value = card.dataset.value;

    // store the choice based on which step we're on
    if (stepNum === 1) quizConfig.category = value;
    if (stepNum === 2) quizConfig.difficulty = value;
    if (stepNum === 3) quizConfig.amount = value;

    // last step? start the quiz
    if (stepNum === 3) {
        console.log("Starting quiz with:", quizConfig);
        // startQuiz(quizConfig)  ← next phase
        return;
    }

    // otherwise advance to the next step
    const nextStepEl = document.querySelector(`.step[data-step="${stepNum + 1}"]`);
    currentStepEl.classList.remove("active");
    currentStepEl.classList.add("leaving");
    nextStepEl.classList.add("active");

    // update the hint
    if (stepHint && hints[stepNum]) stepHint.textContent = hints[stepNum];
});