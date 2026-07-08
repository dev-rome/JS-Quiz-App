export const quizConfig = { category: null, difficulty: null, amount: null };

export const questionsConfig = { question: [], currentIndex: 0, score: 0 };

export const categories = [
    { id: "9", name: "General Knowledge", icon: "🧠" },
    { id: "17", name: "Science & Nature", icon: "🔬" },
    { id: "23", name: "History", icon: "📜" },
    { id: "22", name: "Geography", icon: "🌍" },
    { id: "11", name: "Film", icon: "🎬" },
    { id: "18", name: "Computers", icon: "💻" },
    { id: "21", name: "Sports", icon: "⚽" },
    { id: "12", name: "Music", icon: "🎵" },
];

export function resetQuizState() {
    quizConfig.category = null;
    quizConfig.difficulty = null;
    quizConfig.amount = null;
    questionsConfig.question = [];
    questionsConfig.currentIndex = 0;
    questionsConfig.score = 0;
}