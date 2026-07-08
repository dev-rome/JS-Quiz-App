export function resetQuizUI() {
    document.querySelectorAll(".step")
        .forEach((step) => {
            step.classList.remove("active", "leaving");
        });
    document
        .querySelector('.step[data-step="1"]')
        .classList.add("active");
    document.querySelectorAll(".choice-card")
        .forEach((card) => {
            card.classList.remove("selected");
        });
    const subjectLabel = document.querySelector("#subject-label");
    if (subjectLabel) {
        subjectLabel.textContent = "";
    }
}