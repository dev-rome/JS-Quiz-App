import { quizConfig, questionsConfig, categories } from "./state.js";

export function saveScore(categories) {
    const saved = localStorage.getItem("highScores");
    const scores = saved ? JSON.parse(saved) : [];
    const categoryName =
        categories.find((c) => c.id === quizConfig.category)?.name || "Unknown";
    const entry = {
        score: questionsConfig.score,
        total: questionsConfig.question.length,
        category: categoryName,
        date: new Date().toLocaleDateString(),
    };
    scores.push(entry);
    localStorage.setItem("highScores", JSON.stringify(scores));
}

export function renderHighScores() {
    const saved = localStorage.getItem("highScores");
    const scores = saved ? JSON.parse(saved) : [];
    const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 5);
    const highScoresList = document.querySelector("#high-scores-list");
    highScoresList.innerHTML = topScores.map((entry) => {
        return `<li>${entry.score}/${entry.total} — ${entry.category} <span>${entry.date}</span></li>`;
    }).join("");
}