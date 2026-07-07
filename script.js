"use strict";

// --- Theme toggle ---
const checkBoxTheme = document.querySelector("#theme-checkbox");

// flip the theme when the switch is toggled, and remember the choice
checkBoxTheme.addEventListener("change", () => {
    // checked = light, unchecked = dark (dark is the default)
    const theme = checkBoxTheme.checked ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
});

// on load, restore the saved theme (if the user chose one before)
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    // sync the switch position to match the restored theme
    checkBoxTheme.checked = savedTheme === "light";
}

// --- List of categories ---
const categories = [
    { id: "9", name: "General Knowledge", icon: "🧠" },
    { id: "17", name: "Science & Nature", icon: "🔬" },
    { id: "23", name: "History", icon: "📜" },
    { id: "22", name: "Geography", icon: "🌍" },
    { id: "11", name: "Film", icon: "🎬" },
    { id: "18", name: "Computers", icon: "💻" },
    { id: "21", name: "Sports", icon: "⚽" },
    { id: "12", name: "Music", icon: "🎵" },
];

// --- Render Categories ---
function renderCategories() {
    const shuffleCategories = [...categories].sort(() => Math.random() - 0.5);
    const randomCategories = shuffleCategories.slice(0, 4);
    const categoryContainer = document.querySelector("#category-list");

    categoryContainer.innerHTML = randomCategories.map((cat) => `
    <li>
    <button type="button" class="choice-card" data-value="${cat.id}">
      <span class="choice-icon" aria-hidden="true">${cat.icon}</span>
      <span class="choice-name">${cat.name}</span>
    </button>
  </li>
`).join("");
}

renderCategories();

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
stepsContainer.addEventListener("click", async (event) => {
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
        const questions = await fetchQuestions(quizConfig);
        startQuiz(questions);
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

async function fetchQuestions(config) {
    const params = new URLSearchParams();
    params.append("amount", config.amount);
    params.append("category", config.category);
    params.append('type', 'multiple');
    if (config.difficulty) {
        params.append("difficulty", config.difficulty);
    }
    try {
        const url = `https://opentdb.com/api.php?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("There was a error fetching trivia data.");
        }
        const data = await res.json();
        if (data.response_code !== 0) {
            throw new Error("Not enough questions for those options.");
        }
        return data.results;
    } catch (error) {
        console.error("Error fetching data", error.message);
    }
}

// --- State ---
const questionsConfig = { question: [], currentIndex: 0, score: 0, };
// --- Elements ---
const startScreen = document.querySelector(".start-screen");
const questionsScreen = document.querySelector(".question-screen");

let answered = false;

function startQuiz(questions) {
    if (!questions || questions.length === 0) return;

    questionsConfig.question = questions;
    questionsConfig.currentIndex = 0;
    questionsConfig.score = 0;
    startScreen.classList.add("hidden");
    questionsScreen.classList.remove("hidden");

    renderQuestion();
}

function decodeHTML(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}

const answerList = document.querySelector("#answer-list");
const submitBtn = document.querySelector("#submit-btn");
const answerError = document.querySelector("#answer-error");

answerList.addEventListener("click", (event) => {
    if (answered) return;
    const card = event.target.closest(".answer-card");
    if (!card) return;

    // clear selection from all cards, then select the clicked one
    const allCards = answerList.querySelectorAll(".answer-card");
    allCards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
});

submitBtn.addEventListener("click", () => {
    if (answered) return;

    const selectedCard = answerList.querySelector(".answer-card.selected");
    if (!selectedCard) {
        answerError.classList.remove("hidden");
        return;
    }
    answerError.classList.add("hidden");

    // 1. reveal + score (immediate response to this question)
    const currentQuestion = questionsConfig.question[questionsConfig.currentIndex];
    const correctAnswer = currentQuestion.correct_answer;
    const selectedAnswer = selectedCard.dataset.answer;
    const allCards = answerList.querySelectorAll(".answer-card");

    allCards.forEach((card) => {
        if (card.dataset.answer === correctAnswer) card.classList.add("correct");
    });

    const isCorrect = selectedAnswer === correctAnswer;
    if (!isCorrect) selectedCard.classList.add("wrong");
    if (isCorrect) questionsConfig.score++;

    // 2. lock this question
    answered = true;

    // 3. pause, then advance (deferred)
    setTimeout(() => {
        questionsConfig.currentIndex++;
        if (questionsConfig.currentIndex < questionsConfig.question.length) {
            renderQuestion();
        } else {
            console.log("Quiz complete! Score:", questionsConfig.score);
        }
    }, 1500);
});

function renderQuestion() {
    answered = false;
    const currentQuestion = questionsConfig.question[questionsConfig.currentIndex];
    const currentIndex = questionsConfig.currentIndex;
    const total = questionsConfig.question.length;
    const answers = [currentQuestion.correct_answer, ...currentQuestion.incorrect_answers];
    const shuffledAnswers = [...answers].sort(() => Math.random() - 0.5);
    const questionText = document.querySelector(".question-text");
    questionText.textContent = decodeHTML(currentQuestion.question);

    answerList.innerHTML = shuffledAnswers.map((answer, index) => {
        const letter = ["A", "B", "C", "D"][index];
        const decoded = decodeHTML(answer);
        return `
    <li>
      <button type="button" class="answer-card" data-answer="${answer}">
        <span class="answer-letter" aria-hidden="true">${letter}</span>
        <span class="answer-body">${decoded}</span>
      </button>
    </li>
  `;
    }).join("");

    const questionProgress = document.querySelector("#question-progress");
    const progressFill = document.querySelector("#progress-fill");

    questionProgress.textContent = `Question ${currentIndex + 1} of ${total}`;
    progressFill.style.width = ((currentIndex + 1) / total) * 100 + "%";
}