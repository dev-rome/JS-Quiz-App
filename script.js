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
const loadingScreen = document.querySelector("#loading-screen");
const errorScreen = document.querySelector("#error-screen");
const errorText = document.querySelector("#error-text");
const tryAgainBtn = document.querySelector("#try-again-btn");

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
        // show loading, hide start
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
    params.append("type", "multiple");
    if (config.difficulty) {
        params.append("difficulty", config.difficulty);
    }

    const url = `https://opentdb.com/api.php?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error("There was an error fetching trivia data.");
    }

    const data = await res.json();

    if (data.response_code !== 0) {
        throw new Error("Not enough questions for those options.");
    }

    return data.results;
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

    stopTimer();
    revealAnswer(selectedCard);
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

    startTimer();
}

function revealAnswer(selectedCard) {
    const currentQuestion = questionsConfig.question[questionsConfig.currentIndex];
    const correctAnswer = currentQuestion.correct_answer;
    const allCards = answerList.querySelectorAll(".answer-card");

    // always reveal the correct answer (green)
    allCards.forEach((card) => {
        if (card.dataset.answer === correctAnswer) card.classList.add("correct");
    });

    // only if they actually picked something:
    if (selectedCard) {
        const isCorrect = selectedCard.dataset.answer === correctAnswer;
        if (!isCorrect) selectedCard.classList.add("wrong");
        if (isCorrect) questionsConfig.score++;
    }

    // lock this question
    answered = true;

    // pause, then advance
    setTimeout(() => {
        questionsConfig.currentIndex++;
        if (questionsConfig.currentIndex < questionsConfig.question.length) {
            renderQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

const resultsScreen = document.querySelector(".results-screen");
const resultsScore = document.querySelector("#results-score");
const resultsMessage = document.querySelector("#results-message");

function showResults() {
    questionsScreen.classList.add("hidden");
    resultsScreen.classList.remove("hidden");

    const score = questionsConfig.score;
    const total = questionsConfig.question.length;
    resultsScore.textContent = `You scored ${score} out of ${total}`;

    saveScore();
    renderHighScores();

    // optional message based on ratio
    const ratio = score / total;
    let message;
    if (ratio === 1) message = "Perfect score! 🎉";
    else if (ratio >= 0.7) message = "Great job!";
    else if (ratio >= 0.4) message = "Not bad — keep practicing!";
    else message = "Keep trying, you'll get there!";
    resultsMessage.textContent = message;
}

const playAgainBtn = document.querySelector("#play-again-btn");

playAgainBtn.addEventListener("click", () => {
    // switch back to the start screen
    resultsScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");

    // reset the stepped selection back to step 1
    document.querySelectorAll(".step").forEach((step) => {
        step.classList.remove("active", "leaving");
    });
    document.querySelector('.step[data-step="1"]').classList.add("active");

    // reset the collected config + fresh categories
    quizConfig.category = null;
    quizConfig.difficulty = null;
    quizConfig.amount = null;
    renderCategories();
});

let timerId = null;
let timeLeft = 15;
const timerEl = document.querySelector("#timer");

function startTimer() {
    stopTimer();
    timeLeft = 15;
    timerEl.textContent = timeLeft;
    timerEl.classList.remove("low");

    timerId = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 5) {
            timerEl.classList.add("low");
        }

        if (timeLeft <= 0) {
            stopTimer();
            answerError.classList.add("hidden");
            revealAnswer(null);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerId);
}

function saveScore() {
    // 1. read existing scores (default to empty array if none)
    const saved = localStorage.getItem("highScores");
    const scores = saved ? JSON.parse(saved) : [];

    // 2. map the category id → name for display
    const categoryName =
        categories.find((c) => c.id === quizConfig.category)?.name || "Unknown";

    // 3. build the new entry
    const entry = {
        score: questionsConfig.score,
        total: questionsConfig.question.length,
        category: categoryName,
        date: new Date().toLocaleDateString(),
    };

    // 4. add it and save back
    scores.push(entry);
    localStorage.setItem("highScores", JSON.stringify(scores));
}

function renderHighScores() {
    const saved = localStorage.getItem("highScores");
    const scores = saved ? JSON.parse(saved) : [];
    const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 5);
    const highScoresList = document.querySelector("#high-scores-list");

    highScoresList.innerHTML = topScores.map((entry) => {
        return `<li>${entry.score}/${entry.total} — ${entry.category} <span>${entry.date}</span></li>`;
    }).join("");
}

tryAgainBtn.addEventListener("click", () => {
    errorScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    // reset steps to step 1 (like Play Again)
    document.querySelectorAll(".step").forEach((s) => s.classList.remove("active", "leaving"));
    document.querySelector('.step[data-step="1"]').classList.add("active");
});