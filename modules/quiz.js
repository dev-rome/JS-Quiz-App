import { quizConfig, questionsConfig, categories, resetQuizState } from "./state.js";
import { saveScore, renderHighScores } from "./storage.js";
import { startTimer, stopTimer } from "./timer.js";
import { decodeHTML } from "../utils/decode.js";
import { resetQuizUI } from "./ui.js";

const startScreen = document.querySelector(".start-screen");
const questionsScreen = document.querySelector(".question-screen");
const resultsScreen = document.querySelector(".results-screen");
const resultsScore = document.querySelector("#results-score");
const resultsMessage = document.querySelector("#results-message");
const answerList = document.querySelector("#answer-list");
const answerError = document.querySelector("#answer-error");
const timerEl = document.querySelector("#timer");
const submitBtn = document.querySelector("#submit-btn");
const playAgainBtn = document.querySelector("#play-again-btn");
const errorScreen = document.querySelector("#error-screen");

let answered = false;

export function renderQuestion() {
    answered = false;
    const currentQuestion =
        questionsConfig.question[questionsConfig.currentIndex];
    if (!currentQuestion) return;
    const currentIndex = questionsConfig.currentIndex;
    const total = questionsConfig.question.length;
    const answers = [
        currentQuestion.correct_answer,
        ...currentQuestion.incorrect_answers,
    ];
    const shuffledAnswers = [...answers].sort(
        () => Math.random() - 0.5
    );
    const questionText = document.querySelector(".question-text");
    questionText.textContent = decodeHTML(
        currentQuestion.question
    );
    answerList.innerHTML = shuffledAnswers
        .map((answer, index) => {
            const letter = ["A", "B", "C", "D"][index];
            return `
                <li>
                    <button 
                        type="button" 
                        class="answer-card"
                        data-answer="${answer}"
                    >
                        <span class="answer-letter">
                            ${letter}
                        </span>

                        <span class="answer-body">
                            ${decodeHTML(answer)}
                        </span>
                    </button>
                </li>
            `;
        })
        .join("");
    const questionProgress =
        document.querySelector("#question-progress");
    const progressFill =
        document.querySelector("#progress-fill");

    questionProgress.textContent =
        `Question ${currentIndex + 1} of ${total}`;

    progressFill.style.width =
        `${((currentIndex + 1) / total) * 100}%`;
    startTimer(
        () => {
            answerError.classList.add("hidden");
            revealAnswer(null);
        },
        (timeLeft) => {
            timerEl.textContent = timeLeft;
            if (timeLeft <= 5) {
                timerEl.classList.add("low");
            } else {
                timerEl.classList.remove("low");
            }
        }
    );
}

export function renderCategories() {
    const shuffledCategories = [...categories]
        .sort(() => Math.random() - 0.5);
    const randomCategories =
        shuffledCategories.slice(0, 4);
    const categoryContainer =
        document.querySelector("#category-list");
    categoryContainer.innerHTML =
        randomCategories
            .map((category) => {
                return `
                    <li>
                        <button 
                            type="button"
                            class="choice-card"
                            data-value="${category.id}"
                        >
                            <span class="choice-icon">
                                ${category.icon}
                            </span>

                            <span class="choice-name">
                                ${category.name}
                            </span>
                        </button>
                    </li>
                `;
            })
            .join("");
}

export function startQuiz(questions) {
    if (!questions || questions.length === 0) {
        return;
    }
    questionsConfig.question = questions;
    questionsConfig.currentIndex = 0;
    questionsConfig.score = 0;
    startScreen.classList.add("hidden");
    questionsScreen.classList.remove("hidden");
    renderQuestion();
}

export function revealAnswer(selectedCard) {
    const currentQuestion =
        questionsConfig.question[
        questionsConfig.currentIndex
        ];
    const correctAnswer =
        currentQuestion.correct_answer;
    const allCards =
        answerList.querySelectorAll(".answer-card");
    allCards.forEach((card) => {
        if (card.dataset.answer === correctAnswer) {
            card.classList.add("correct");
        }
    });
    if (selectedCard) {
        const isCorrect =
            selectedCard.dataset.answer === correctAnswer;
        if (!isCorrect) {
            selectedCard.classList.add("wrong");
        }
        if (isCorrect) {
            questionsConfig.score++;
        }
    }
    answered = true;
    setTimeout(() => {
        questionsConfig.currentIndex++;
        if (
            questionsConfig.currentIndex <
            questionsConfig.question.length
        ) {
            renderQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

export function showResults() {
    questionsScreen.classList.add("hidden");
    resultsScreen.classList.remove("hidden");
    const score = questionsConfig.score;
    const total = questionsConfig.question.length;
    resultsScore.textContent =
        `You scored ${score} out of ${total}`;
    saveScore(categories);
    renderHighScores();
    const ratio = score / total;
    let message;
    if (ratio === 1) {
        message = "Perfect score! 🎉";
    } else if (ratio >= 0.7) {
        message = "Great job!";
    } else if (ratio >= 0.4) {
        message = "Not bad — keep practicing!";
    } else {
        message = "Keep trying, you'll get there!";
    }
    resultsMessage.textContent = message;
}

answerList.addEventListener("click", (event) => {
    if (answered) return;
    const card =
        event.target.closest(".answer-card");
    if (!card) return;
    const allCards =
        answerList.querySelectorAll(".answer-card");
    allCards.forEach((card) => {
        card.classList.remove("selected");
    });
    card.classList.add("selected");
});

submitBtn.addEventListener("click", () => {
    if (answered) return;
    const selectedCard =
        answerList.querySelector(
            ".answer-card.selected"
        );
    if (!selectedCard) {
        answerError.classList.remove("hidden");
        return;
    }
    answerError.classList.add("hidden");
    stopTimer();
    revealAnswer(selectedCard);
});

playAgainBtn.addEventListener("click", () => {
    resultsScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    resetQuizState();
    resetQuizUI();
    renderCategories();
});