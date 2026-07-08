export function resetQuizUI() {
    document.querySelectorAll(".step")
        .forEach((step) => {
            step.classList.remove("active", "leaving");
        });

    document
        .querySelector('.step[data-step="1"]')
        .classList.add("active");
}