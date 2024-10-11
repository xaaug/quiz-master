const url = "https://the-trivia-api.com/v2/questions";

const heroSection = document.querySelector(".hero");
const questionNo = document.getElementById("question-no");
const startQuizBtn = document.querySelector(".start-quiz");
const questionsContainer = document.querySelector(".questions-container");
const questionDiv = document.querySelector(".question");
const spinner = document.getElementById("loading");
const nextBtn = document.getElementById("next-btn");
const doneBtn = document.getElementById("done-btn");
const failedQuestionsEl = document.querySelector(".failed-questions");
const passedQuestionsEl = document.querySelector(".passed-questions");
const scoreEl = document.querySelector(".score-el");
const closeModalBtn = document.querySelector(".close-modal-btn");
const quitBtn = document.querySelector(".quit-btn");
const newQuizBtn = document.querySelector(".new-quiz-btn");
const saveScoreField = document.querySelector(".save-score");
const saveScoreBtn = document.querySelector(".save-score-btn");
const previousPlayers = document.querySelector(".previous-players");
const scoreHistoryField = document.querySelector(".scores");
const scoreHistoryTitle = document.querySelector(".score-title");
const highScoreEl = document.querySelector(".high-score");
const scoresBtn = document.querySelector(".scores-btn");
const homeBtn = document.querySelector(".home-btn");
const questionHistory = document.querySelector(".all-history");
const clearHistoryBtn = document.querySelector(".clear-history");
const refreshHistory = document.querySelector(".refresh-history");
const refreshEl = document.querySelector(".refresh");
const nameInput = document.getElementById("floatingInput");

let currentScore = 0;
let scores = [];
let questionsArray = [];
let failedQuestions = [];
let passedQuestions = [];
let playerName = "";

const fetchQuestions = async () => {
  spinner.style.display = "flex";
  questionsContainer.style.display = "inline-block";
  questionNo.style.display = "none";
  quitBtn.style.display = "none";

  try {
    const response = await fetch(url);
    const data = await response.json();

    spinner.style.display = "none";
    questionNo.style.display = "block";
    quitBtn.style.display = "block";

    return data;
  } catch (error) {
    console.error(error);
    spinner.style.display = "none";
  }
};

const startQuiz = async () => {
  const questions = await fetchQuestions();
  questionDiv.innerHTML = "";
  doneBtn.style.display = "none";

  failedQuestions = [];
  passedQuestions = [];

  displayQuestion(questions, 0);

  nextBtn.style.display = "inline-block";

  console.log(localStorage.length);
};

let currentQuestionIndex = 1;
let questionArray = [];
const displayQuestion = (arr, index) => {
  const questionsParent = document.createElement("div");
  questionArray = arr;

  const questionContainer = document.createElement("div");
  const questionEl = document.createElement("h3");
  const quesTionText = document.createTextNode(arr[index].question.text);
  questionEl.appendChild(quesTionText);
  questionEl.setAttribute("class", "question");
  questionContainer.appendChild(questionEl);

  const categoryEl = document.createElement("span");
  const categoryText = document.createTextNode(
    arr[index].category.charAt(0).toUpperCase() + arr[index].category.slice(1)
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
    arr[index].difficulty.charAt(0).toUpperCase() +
      arr[index].difficulty.slice(1)
  );
  difficultyEl.appendChild(difficultyText);
  difficultyEl.setAttribute(
    "class",
    "difficulty badge rounded-pill bg-success"
  );
  difficultyEl.style.fontSize = ".8rem";
  questionEl.appendChild(difficultyEl);

  const answers = [...arr[index].incorrectAnswers, arr[index].correctAnswer];
  const randomAnswers = shuffleArray(answers);
  const correctAnswer = arr[index].correctAnswer;
  console.log(correctAnswer);

  const answersList = document.createElement("div");
  answersList.setAttribute("class", "list-group answers");

  randomAnswers.forEach((answer) => {
    answersList.innerHTML += `<button type='button' data-state=${
      answer === correctAnswer ? "correct" : "incorrect"
    } class='list-group-item list-group-item-action answer-btn' >${answer}</button>`;

    questionContainer.appendChild(answersList);
  });

  questionsParent.appendChild(questionContainer);
  //   questionNo.textContent = `Question 1`;
  questionNo.textContent = `Question ${index + 1}`;
  //   questionsArray = questionsParent.children;

  questionDiv.appendChild(questionsParent);
  nextBtn.disabled = true;
  doneBtn.disabled = true;
  checkAnswers();
};

const displayNextQuestion = () => {
  if (currentQuestionIndex < questionArray.length) {
    questionDiv.innerHTML = "";
    displayQuestion(questionArray, currentQuestionIndex);
    currentQuestionIndex++;
  } else if (currentQuestionIndex === questionArray.length) {
    nextBtn.style.display = "none";
    doneBtn.style.display = "inline-block";
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

const checkQuestionStatus = (e, state) => {
  const targetText =
    e.target.parentElement.parentNode.children[0].childNodes[0].textContent;
  questionArray.forEach(({ correctAnswer, question }) => {
    if (question.text === targetText) {
      state.push({
        query: question.text,
        rightAnswer: correctAnswer,
      });
    }
  });
};

const showResults = () => {
  // Clear previous content to avoid duplication
  scores.push(currentScore);
  failedQuestionsEl.innerHTML = "";
  passedQuestionsEl.innerHTML = "";

  if (!failedQuestions.length) {
    failedQuestionsEl.innerHTML = `<h6>Hooray! You got all the questions right</h6>`;

    passedQuestions.forEach(({ query, rightAnswer }, index) => {
      passedQuestionsEl.innerHTML += `
                <div class="border p-2 d-flex flex-column ${
                  index > 0 ? "mt-2" : "mt-0"
                }">
                    <div class="d-flex align-items-start gap-1">
                        <p class="text-success">${index + 1}.</p>
                        <h6>${query}</h6>
                    </div> 
                    <p><strong>Your Answer:</strong> <i>${rightAnswer}</i></p>
                </div>`;
    });

    scoreEl.textContent = `${currentScore} / ${questionArray.length}`;
  } else if (failedQuestions.length === questionArray.length) {
    passedQuestionsEl.innerHTML = `<h6>OH NO! You failed all questions</h6>`;

    failedQuestions.forEach(({ query, rightAnswer }, index) => {
      failedQuestionsEl.innerHTML += `
                <div class="border p-2 d-flex flex-column ${
                  index > 0 ? "mt-2" : "mt-0"
                }">
                    <div class="d-flex align-items-start gap-1">
                        <p class="text-danger">${index + 1}.</p>
                        <h6>${query}</h6>
                    </div> 
                    <p><strong>Correct Answer:</strong> <i>${rightAnswer}</i></p>
                </div>`;
    });

    scoreEl.textContent = `${currentScore} / ${questionArray.length}`;
  } else {
    // Handle case when there are some failed questions but not all
    passedQuestions.forEach(({ query, rightAnswer }, index) => {
      passedQuestionsEl.innerHTML += `
                <div class="border p-2 d-flex flex-column ${
                  index > 0 ? "mt-2" : "mt-0"
                }">
                    <div class="d-flex align-items-start gap-1">
                        <p class="text-success">${index + 1}.</p>
                        <h6>${query}</h6>
                    </div> 
                    <p><strong>Your Answer:</strong> <i>${rightAnswer}</i></p>
                </div>`;
    });

    failedQuestions.forEach(({ query, rightAnswer }, index) => {
      failedQuestionsEl.innerHTML += `
                <div class="border p-2 d-flex flex-column ${
                  index > 0 ? "mt-2" : "mt-0"
                }">
                    <div class="d-flex align-items-start gap-1">
                        <p class="text-danger">${index + 1}.</p>
                        <h6>${query}</h6>
                    </div> 
                    <p><strong>Correct Answer:</strong> <i>${rightAnswer}</i></p>
                </div>`;
    });

    scoreEl.textContent = `${currentScore} / ${questionArray.length}`;
  }

  if (localStorage.length) {
    const userData = JSON.parse(localStorage.getItem("score"));
    playerName = userData.name;
    previousPlayers.style.display = "block";
    saveScoreField.style.display = "none";
    document.querySelector(".player-score").textContent =
      playerName + " 's Score";
    const userScore = {
      name: playerName,
      allScores: scores,
      questionsData: [
        ...userData.questionsData,
        {
          total: questionArray.length,
          score: currentScore,
          failed: failedQuestions,
          passed: passedQuestions,
        },
      ],
    };
    localStorage.setItem("score", JSON.stringify(userScore));

    // TODO Display previous players as buttons
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const name = JSON.parse(localStorage.getItem(key));
      previousPlayers.innerHTML += `<button class='btn btn-primary player-btn'>${
        name.name.charAt(0).toUpperCase() + name.name.slice(1)
      }</button>`;
    }
  }
};

const handleAnswer = (e) => {
  const answerBtnGroup = Array.from(e.target.parentElement.children);

  if (e.target.getAttribute("data-state") === "correct") {
    nextBtn.disabled = false;
    const prevClasses = e.target.getAttribute("class");
    e.target.className = prevClasses + " list-group-item-success" || "";
    currentScore++;

    if (currentQuestionIndex === questionArray.length) {
      doneBtn.disabled = false;
    }

    checkQuestionStatus(e, passedQuestions);

    for (const item of answerBtnGroup) {
      if (item.getAttribute("data-state") === "incorrect") {
        const previousClasses = item.getAttribute("class");
        item.className = previousClasses + " list-group-item-secondary";
      }
    }
  } else if (e.target.getAttribute("data-state") === "incorrect") {
    nextBtn.disabled = false;
    if (currentQuestionIndex === questionArray.length) {
      doneBtn.disabled = false;
    }

    checkQuestionStatus(e, failedQuestions);

    e.target.className =
      e.target.getAttribute("class") + " list-group-item-danger";
    // console.log(e.target.parentElement.parentNode);

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
  }, 200);
};

const saveScore = () => {
  if (!localStorage.length) {
    
    let name = "";
    if (nameInput.value) {
      name = nameInput.value;
      nameInput.className = "form-control";
      nameInput.value = "";
      document.querySelector(".player-score").textContent = name + " 's Score";
      saveScoreField.style.display = "none";
    } else {
      nameInput.className = `${nameInput.getAttribute("class")} is-invalid`;
      return;
    }

    const userScore = {
      name: name,
      allScores: scores,
      questionsData: [
        {
          total: questionArray.length,
          score: currentScore,
          failed: failedQuestions,
          passed: passedQuestions,
        },
      ],
    };
    localStorage.setItem("score", JSON.stringify(userScore));
  } else if (localStorage.length) {
  }
};

const quitQuiz = () => {
  questionDiv.innerHTML = "";
  questionsContainer.style.display = "none";
  heroSection.style.display = "flex";
  doneBtn.style.display = "none";
  nextBtn.style.display = "none";
  questionArray = [];
  currentQuestionIndex = 1;
  failedQuestions = [];
  passedQuestions = [];
  currentScore = 0;
};

const exitQuiz = () => {
  questionsContainer.style.display = "none";
  heroSection.style.display = "flex";
  questionDiv.innerHTML = "";
  questionArray = [];
  failedQuestions = [];
  passedQuestions = [];
  currentQuestionIndex = 1;
  doneBtn.style.display = "none";
  currentScore = 0;
};

const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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

nextBtn.addEventListener("click", displayNextQuestion);
doneBtn.addEventListener("click", showResults);
closeModalBtn.addEventListener("click", exitQuiz);
quitBtn.addEventListener("click", quitQuiz);
newQuizBtn.addEventListener("click", () => {
  saveScore();
  questionArray = [];
  currentScore = 0;
  currentQuestionIndex = 1;
  questionDiv.innerHTML = "";
  doneBtn.style.display = "none";
  startQuiz();
});

saveScoreBtn.addEventListener("click", () => {
  saveScore();
});

scoresBtn.addEventListener("click", () => {
  heroSection.style.display = "none";
  questionsContainer.style.display = "none";
  scoresBtn.style.display = "none";
  homeBtn.style.display = "block";
  scoreHistoryField.style.display = "block";
  refreshEl.style.display = "block";

  // TODO: Convert to a funtion

  if (localStorage.length) {
    clearHistoryBtn.style.display = "block";
    const userData = JSON.parse(localStorage.getItem("score")) || {};
    scoreHistoryTitle.textContent = `${userData.name}'s Score History`;
    highScoreEl.textContent = `Highest Score: ${
      userData.allScores.sort()[userData.allScores.length - 1]
    } Questions`;

    const historyHTML = userData.questionsData
      .map((item) => {
        return `<div class="history border px-2 mb-3 py-2">
      <h5 class="score mt-3">Score: ${item.score} / ${item.total}</h5>
      <h5 class="mt-1">Failed</h5>
      <div class="history-failed">${item.failed
        .map(
          (question, index) => `
                <div class="border p-2 d-flex flex-column ${
                  index > 0 ? "mt-2" : "mt-0"
                }">
                    <div class="d-flex align-items-start gap-1">
                        <p class="text-danger">${index + 1}.</p>
                        <h6>${question.query}</h6>
                    </div> 
                    <p><strong>Your Answer:</strong> <i>${
                      question.rightAnswer
                    }</i></p>
                </div>`
        )
        .join("")}</div>
      <h5 class="mt-2">Passed</h5>
      <div class="history-passed">${item.passed
        .map(
          (question, index) =>
            `
                <div class="border p-2 d-flex flex-column ${
                  index > 0 ? "mt-2" : "mt-0"
                } ">
                    <div class="d-flex align-items-start gap-1">
                        <p class="text-success">${index + 1}.</p>
                        <h6>${question.query}</h6>
                    </div> 
                    <p><strong>Your Answer:</strong> <i>${
                      question.rightAnswer
                    }</i></p>
                </div>`
        )
        .join("")}</div>
    </div>
  </div>`;
      })
      .join("");

    questionHistory.innerHTML = historyHTML;
  } else if (!localStorage.length) {
    scoreHistoryField.innerHTML = `<div><p class="fs-4 fw-bold">
      Whoa there, adventurer! Looks like you haven’t saved anything yet. Are you living on the edge or
      just trusting your memory a little too much? 😆</p> </div>`;
  }
});

homeBtn.addEventListener("click", () => {
  heroSection.style.display = "flex";
  scoreHistoryField.style.display = "none";
  refreshEl.style.display = "none";

  homeBtn.style.display = "none";
  scoresBtn.style.display = "block";
});

clearHistoryBtn.addEventListener("click", () => {
  if (localStorage.length) {
    localStorage.clear();
    location.reload();
  } else return;
});

refreshHistory.addEventListener("click", () => {
  location.reload();
});

nameInput.addEventListener('keydown', e => {
  if (e.keyCode === 13) {
    saveScore()
  }
})