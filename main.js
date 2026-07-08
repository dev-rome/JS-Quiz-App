"use strict";

import { initTheme } from "./modules/theme.js";
import { quizConfig, categories, resetQuizState } from "./modules/state.js";
import { fetchQuestions } from "./modules/api.js";
import { renderCategories, startQuiz } from "./modules/quiz.js";
import { resetQuizUI } from "./modules/ui.js";

renderCategories(categories);

const startScreen = document.querySelector(".start-screen");
const stepsContainer = document.querySelector(".steps");
const stepHint = document.querySelector(".intro p");
const loadingScreen = document.querySelector("#loading-screen");
const errorScreen = document.querySelector("#error-screen");
const errorText = document.querySelector("#error-text");
const tryAgainBtn = document.querySelector("#try-again-btn");

const hints = {
    1: "Choose a difficulty.",
    2: "How many questions?",
    3: "Starting your quiz...",
};

stepsContainer.addEventListener("click", async (event) => {
    const card = event.target.closest(".choice-card");
    if (!card) return;
    const currentStepEl = card.closest(".step");
    const stepNum = Number(currentStepEl.dataset.step);
    const value = card.dataset.value;
    if (stepNum === 1) quizConfig.category = value;
    if (stepNum === 2) quizConfig.difficulty = value;
    if (stepNum === 3) quizConfig.amount = value;
    if (stepNum === 3) {
        startScreen.classList.add("hidden");
        loadingScreen.classList.remove("hidden");
        try {
            const questions = await fetchQuestions(quizConfig);
            startQuiz(questions);
        } catch (error) {
            errorText.textContent = error.message;
            errorScreen.classList.remove("hidden");
        } finally {
            loadingScreen.classList.add("hidden");
        }
        return;
    }
    const nextStepEl = document.querySelector(
        `.step[data-step="${stepNum + 1}"]`
    );
    currentStepEl.classList.remove("active");
    currentStepEl.classList.add("leaving");
    nextStepEl.classList.add("active");
    if (stepHint && hints[stepNum]) {
        stepHint.textContent = hints[stepNum];
    }
});

tryAgainBtn.addEventListener("click", () => {
    errorScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    resetQuizState();
    resetQuizUI();
    renderCategories(categories);
});

initTheme();