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

const AUTO_NEXT_MS = 5000;

let categories = [];
let questions = [];
let currentIndex = 0;
let score = 0;
let currentCategory = "";
let currentCategoryName = "";
let answered = false;
let autoNextTimer = null;

const homePage = document.getElementById("home-page");
const quizPage = document.getElementById("quiz-page");
const donePage = document.getElementById("done-page");
const categoryButtonsEl = document.getElementById("category-buttons");
const quizTitle = document.getElementById("quiz-title");
const progress = document.getElementById("progress");
const questionText = document.getElementById("question-text");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const feedbackIcon = document.getElementById("feedback-icon");
const feedbackText = document.getElementById("feedback-text");
const answerLabel = document.getElementById("answer-label");
const explanationText = document.getElementById("explanation-text");
const nextBtn = document.getElementById("next-btn");
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

function clearAutoNextTimer() {
    if (autoNextTimer) {
        clearTimeout(autoNextTimer);
        autoNextTimer = null;
    }
}

function goToNextQuestion() {
    clearAutoNextTimer();
    currentIndex++;
    if (currentIndex >= questions.length) {
        showDonePage();
    } else {
        showQuestion();
    }
}

async function loadCategories() {
    try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("加载分类失败");
        categories = await res.json();
        renderCategoryButtons();
    } catch {
        categoryButtonsEl.innerHTML =
            '<p class="load-error">分类加载失败，请刷新页面重试。</p>';
    }
}

function renderCategoryButtons() {
    categoryButtonsEl.innerHTML = "";
    categories.forEach((cat, index) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-category";
        btn.dataset.category = cat.id;
        if (index % 2 === 1) {
            btn.classList.add("btn-category-alt");
        }

        const icon = document.createElement("span");
        icon.className = "btn-icon";
        icon.textContent = cat.icon;

        const text = document.createElement("span");
        text.className = "btn-text";
        text.textContent = cat.name;

        btn.append(icon, text);
        btn.addEventListener("click", () => startQuiz(cat.id, cat.name));
        categoryButtonsEl.appendChild(btn);
    });
}

async function startQuiz(category, categoryName) {
    currentCategory = category;
    currentCategoryName = categoryName || category;
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

    quizTitle.textContent = currentCategoryName;
    showPage(quizPage);
    showQuestion();
}

function showQuestion() {
    clearAutoNextTimer();
    answered = false;
    feedbackEl.classList.add("hidden");
    feedbackEl.classList.remove("correct", "wrong");
    nextBtn.classList.add("hidden");

    const q = questions[currentIndex];
    questionText.textContent = q.question;
    progress.textContent = `第 ${currentIndex + 1} / ${questions.length} 题`;

    optionsEl.replaceChildren();
    shuffleArray(q.options).forEach((option) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.type = "button";
        btn.textContent = option;
        btn.addEventListener("click", () => handleAnswer(option, btn));
        optionsEl.appendChild(btn);
    });
}

async function handleAnswer(selected, clickedBtn) {
    if (answered) return;
    answered = true;

    const q = questions[currentIndex];
    let result;

    try {
        const res = await fetch("/api/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                category: currentCategory,
                id: q.id,
                answer: selected,
            }),
        });
        if (!res.ok) throw new Error("判题失败");
        result = await res.json();
    } catch {
        answered = false;
        alert("提交答案失败，请稍后再试！");
        return;
    }

    const isCorrect = result.correct;
    if (isCorrect) score++;

    document.querySelectorAll(".option-btn").forEach((btn) => {
        btn.disabled = true;
        if (btn.textContent === result.answer) {
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
    answerLabel.textContent = `正确答案：${result.answer}`;
    explanationText.textContent = result.explanation;
    nextBtn.classList.remove("hidden");

    autoNextTimer = setTimeout(goToNextQuestion, AUTO_NEXT_MS);
}

function showDonePage() {
    doneScore.textContent = `本次得分：${score} / ${questions.length}`;
    showPage(donePage);
}

document.getElementById("back-btn").addEventListener("click", () => {
    clearAutoNextTimer();
    showPage(homePage);
});

document.getElementById("next-btn").addEventListener("click", goToNextQuestion);

document.getElementById("restart-btn").addEventListener("click", () => {
    startQuiz(currentCategory, currentCategoryName);
});

document.getElementById("home-btn").addEventListener("click", () => {
    showPage(homePage);
});

loadCategories();
