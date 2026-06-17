const CATEGORY_NAMES = {
    position: "位置与方向",
    division: "除法",
};

const CORRECT_MESSAGES = [
    "太棒了！🌟",
    "答对啦！你真厉害！👏",
    "完全正确！继续加油！💪",
    "好样的！数学小天才！🎉",
];

const WRONG_MESSAGES = [
    "没关系，再看看解析！💡",
    "加油！下次一定行！🌈",
    "别灰心，学习就是在进步！📖",
    "再接再厉！爸爸陪你一起学！❤️",
];

let questions = [];
let currentIndex = 0;
let score = 0;
let currentCategory = "";
let answered = false;
let autoNextTimer = null;

const homePage = document.getElementById("home-page");
const quizPage = document.getElementById("quiz-page");
const donePage = document.getElementById("done-page");
const quizTitle = document.getElementById("quiz-title");
const progress = document.getElementById("progress");
const questionText = document.getElementById("question-text");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const feedbackIcon = document.getElementById("feedback-icon");
const feedbackText = document.getElementById("feedback-text");
const explanationEl = document.getElementById("explanation");
const doneScore = document.getElementById("done-score");

function showPage(page) {
    [homePage, quizPage, donePage].forEach((p) => p.classList.remove("active"));
    page.classList.add("active");
}

function randomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

async function startQuiz(category) {
    currentCategory = category;
    currentIndex = 0;
    score = 0;
    answered = false;

    try {
        const res = await fetch(`/api/questions/${category}`);
        if (!res.ok) throw new Error("加载题目失败");
        questions = shuffleArray(await res.json());
    } catch {
        alert("题目加载失败，请稍后再试！");
        return;
    }

    quizTitle.textContent = CATEGORY_NAMES[category];
    showPage(quizPage);
    showQuestion();
}

function showQuestion() {
    if (autoNextTimer) {
        clearTimeout(autoNextTimer);
        autoNextTimer = null;
    }

    answered = false;
    feedbackEl.classList.add("hidden");
    feedbackEl.classList.remove("correct", "wrong");

    const q = questions[currentIndex];
    questionText.textContent = q.question;
    progress.textContent = `第 ${currentIndex + 1} / ${questions.length} 题`;

    optionsEl.innerHTML = "";
    shuffleArray(q.options).forEach((option) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = option;
        btn.addEventListener("click", () => handleAnswer(option, btn));
        optionsEl.appendChild(btn);
    });
}

function handleAnswer(selected, clickedBtn) {
    if (answered) return;
    answered = true;

    const q = questions[currentIndex];
    const isCorrect = selected === q.answer;

    if (isCorrect) score++;

    document.querySelectorAll(".option-btn").forEach((btn) => {
        btn.disabled = true;
        if (btn.textContent === q.answer) {
            btn.classList.add("correct");
        } else if (btn === clickedBtn && !isCorrect) {
            btn.classList.add("wrong");
        } else {
            btn.classList.add("dimmed");
        }
    });

    feedbackEl.classList.remove("hidden");
    feedbackEl.classList.add(isCorrect ? "correct" : "wrong");
    feedbackIcon.textContent = isCorrect ? "✅" : "🤔";
    feedbackText.textContent = isCorrect
        ? randomMessage(CORRECT_MESSAGES)
        : randomMessage(WRONG_MESSAGES);
    explanationEl.innerHTML = `<strong>正确答案：${q.answer}</strong><br>${q.explanation}`;

    autoNextTimer = setTimeout(() => {
        currentIndex++;
        if (currentIndex >= questions.length) {
            showDonePage();
        } else {
            showQuestion();
        }
    }, 2500);
}

function showDonePage() {
    doneScore.textContent = `本次得分：${score} / ${questions.length}`;
    showPage(donePage);
}

document.querySelectorAll(".btn-category").forEach((btn) => {
    btn.addEventListener("click", () => startQuiz(btn.dataset.category));
});

document.getElementById("back-btn").addEventListener("click", () => {
    if (autoNextTimer) clearTimeout(autoNextTimer);
    showPage(homePage);
});

document.getElementById("restart-btn").addEventListener("click", () => {
    startQuiz(currentCategory);
});

document.getElementById("home-btn").addEventListener("click", () => {
    showPage(homePage);
});
