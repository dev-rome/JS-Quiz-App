"use strict";
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
        console.log("Questions:", questions);
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