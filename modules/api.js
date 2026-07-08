export async function fetchQuestions(config) {
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