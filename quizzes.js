const quizFiles = [
    "quiz2_ios.json",
    "quiz3_ios.json",
    "quiz4_ios.json",
    "quiz5_ios.json",
    "quiz6_ios.json",
    "quiz7_ios.json",
    "quiz8_ios.json",
    "quiz9_ios.json",
    "quiz10_ios.json",
    "quiz11_perm.json",
    "quiz12_Swift_ios.json"
];

function getQuestionCount(quiz) {
    if (!Array.isArray(quiz?.questions)) {
        return 0;
    }

    return quiz.questions.reduce((total, group) => {
        const groupQuestions = Array.isArray(group?.questions) ? group.questions.length : 0;
        return total + groupQuestions;
    }, 0);
}

function getQuizOrder(quiz) {
    const match = String(quiz?.title || "").match(/Quiz\s+(\d+)/i);
    return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

function cloneQuestion(question) {
    return {
        ...question,
        answers: Array.isArray(question?.answers)
            ? question.answers.map((answer) => ({ ...answer }))
            : []
    };
}

function cloneQuestionGroup(group) {
    return {
        ...group,
        questions: Array.isArray(group?.questions)
            ? group.questions.map((question) => cloneQuestion(question))
            : []
    };
}

function buildCombinedQuiz(loadedQuizzes) {
    const totalQuestions = loadedQuizzes.reduce((total, quiz) => {
        return total + getQuestionCount(quiz);
    }, 0);

    return {
        title: "Osszes quiz",
        description: `${loadedQuizzes.length} quiz egyben`,
        questionCount: totalQuestions,
        questions: loadedQuizzes.flatMap((quiz) => {
            if (!Array.isArray(quiz?.questions)) {
                return [];
            }

            return quiz.questions.map((group) => cloneQuestionGroup(group));
        })
    };
}

async function loadQuizFile(fileName) {
    const response = await fetch(fileName, { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`Nem sikerult betolteni: ${fileName} (${response.status})`);
    }

    return response.json();
}

async function loadQuizzes() {
    const loadedQuizzes = await Promise.all(quizFiles.map((fileName) => loadQuizFile(fileName)));

    loadedQuizzes.sort((left, right) => {
        const orderDifference = getQuizOrder(left) - getQuizOrder(right);

        if (orderDifference !== 0) {
            return orderDifference;
        }

        return String(left?.title || "").localeCompare(String(right?.title || ""), "hu");
    });

    return [buildCombinedQuiz(loadedQuizzes), ...loadedQuizzes];
}

window.loadQuizzes = loadQuizzes;
window.getQuestionCount = getQuestionCount;
