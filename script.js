const url = "https://the-trivia-api.com/v2/questions";

const heroSection = document.querySelector(".hero");
const questionNo = document.getElementById("question-no");
const startQuizBtn = document.getElementById("start-quiz");
const questionsContainer = document.querySelector(".questions-container");
const questionDiv = document.querySelector(".question");
const spinner = document.getElementById("loading");
const nextBtn = document.getElementById("next-btn");

const questionContainer = document.querySelector(".questions");
const newQuestionsBtn = document.getElementById("new");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");

let currentScore = 0;
const scores = [];
let questionsArray = [];

const fetchQuestions = async () => {
  spinner.style.display = "flex";
  questionsContainer.style.display = "inline-block";
  questionNo.style.display = "none";

  try {
    const response = await fetch(url);
    const data = await response.json();

    spinner.style.display = "none";
    questionNo.style.display = "block";

    return data;
  } catch (error) {
    console.error(error);
    spinner.style.display = "none";
  }
};

newQuestionsBtn.style.display = "none";

const startQuiz = async () => {
  const questions = await fetchQuestions();

  nextBtn.style.display = "inline-block";

  displayQuestions(questions);
  checkAnswers();
};

const displayQuestions = (arr) => {
  console.log(arr);
  const questionsParent = document.createElement("div");
  arr.forEach((question, _i) => {
    const questionContainer = document.createElement("div");
    const questionEl = document.createElement("h3");
    const quesTionText = document.createTextNode(question.question.text);
    questionEl.appendChild(quesTionText);
    questionEl.setAttribute("class", "question");
    questionContainer.appendChild(questionEl);

    const categoryEl = document.createElement("span");
    const categoryText = document.createTextNode(
      question.category.charAt(0).toUpperCase() + question.category.slice(1)
    );
    categoryEl.appendChild(categoryText);
    categoryEl.setAttribute(
      "class",
      "category badge rounded-pill bg-info text-dark"
    );
    categoryEl.style.fontSize = ".8rem";
    questionEl.appendChild(categoryEl);

    const difficultyEl = document.createElement("span");
    const difficultyText = document.createTextNode(
      question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)
    );
    difficultyEl.appendChild(difficultyText);
    difficultyEl.setAttribute(
      "class",
      "difficulty badge rounded-pill bg-success"
    );
    difficultyEl.style.fontSize = ".8rem";
    questionEl.appendChild(difficultyEl);

    const answers = [...question.incorrectAnswers, question.correctAnswer];
    const randomAnswers = shuffleArray(answers);
    const correctAnswer = question.correctAnswer;
    console.log(correctAnswer);

    const answersList = document.createElement("div");
    answersList.setAttribute("class", "list-group answers");

    randomAnswers.forEach((answer) => {
      answersList.innerHTML += `<button type='button' data-state=${
        answer === correctAnswer ? "correct" : "incorrect"
      } class='list-group-item list-group-item-action answer-btn' >${answer}</button>`;

      questionContainer.appendChild(answersList);
      //   questionContainer.appendChild(questionEl);
      newQuestionsBtn.style.display = "block";
    });
    questionsParent.appendChild(questionContainer);
  });
  questionsArray = questionsParent.children;

  questionDiv.insertAdjacentElement("afterbegin", questionsArray[0]);
};

let currentQuestionIndex = 0;
const getNextQuestion = (arr) => {
  console.log(arr);
  // questionDiv.innerHTML = `<button type="button" class="btn btn-primary" id="next-btn">Next</button>`
  if (currentQuestionIndex <= arr.length - 1) {
    questionDiv.appendChild(arr[currentQuestionIndex]);
    currentQuestionIndex++;
    console.log(arr[currentQuestionIndex])
  } else if (currentQuestionIndex > arr.length - 1) {
  }
};

const getHighScore = () => {
  const highScore = scores.sort((a, b) => {
    if (a === b) return 0;
    if (a > b) return -1;
    return 1;
  });

  highScoreEl.textContent = highScore[0];
};

const handleAnswer = (e) => {
  // console.log('Button clicked')
  const answerBtnGroup = Array.from(e.target.parentElement.children);

  if (e.target.getAttribute("data-state") === "correct") {
    const prevClasses = e.target.getAttribute("class");
    e.target.className = prevClasses + " list-group-item-success" || "";
    currentScore++;
    // scoreEl.textContent = currentScore;
    console.log(currentScore);

    for (const item of answerBtnGroup) {
      if (item.getAttribute("data-state") === "incorrect") {
        const previousClasses = item.getAttribute("class");
        item.className = previousClasses + " list-group-item-secondary";
      }
    }
  } else if (e.target.getAttribute("data-state") === "incorrect") {
    e.target.className =
      e.target.getAttribute("class") + " list-group-item-danger";

    for (const btn of answerBtnGroup) {
      if (btn.getAttribute("data-state") === "correct") {
        btn.className = btn.getAttribute("class") + " list-group-item-success";
      }
    }
  }
};

const checkAnswers = () => {
  const answerGroup = document.querySelectorAll(".answers");
  setTimeout(() => {
    answerGroup.forEach((group) => {
      group.addEventListener(
        "click",
        (e) => {
          if (e.target.classList.contains("answer-btn")) {
            // console.log(e.target)
            const answerBtns = [];
            answerBtns.push(e.target);
            // console.log(answerBtns)
            for (btn of answerBtns) {
              handleAnswer(e);
              // console.log(btn)
            }
          }
        },
        { once: true }
      );
    });
  }, 500);
};

//   const shuffledArray = arr => {
//     for (let i = arr.length - 1; i > 0; i--) {
//         const r = Math.floor(Math.random() * (i + 1))

//         [arr[i], arr[r]] = [arr[r], arr[i]]
//     }
//     return arr
//   }

const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // [arr[i], arr[j]] = [arr[j], arr[i]];
    arr.push(arr[j]);
    arr.splice(j, 1);
  }
  return arr;
};

startQuizBtn.addEventListener("click", () => {
  startQuiz();

  heroSection.style.display = "none";
  //   generateBtn.style.display = "none";
  //   document.getElementById("score-parent").style.display = "flex";
});

newQuestionsBtn.addEventListener("click", () => {
  questionContainer.innerHTML = "";
  displayQuestions();
  scores.push(currentScore);
  currentScore = 0;
  scoreEl.textContent = currentScore;
  console.log(scores);
  getHighScore();
});

nextBtn.addEventListener("click", () => {
  getNextQuestion(questionsArray);
});
