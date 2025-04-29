const user1Form = document.getElementById('user1-form');
const user2Form = document.getElementById('user2-form');
const user1SubjectInput = document.getElementById('user1-subject');
const user1ChaptersInput = document.getElementById('user1-chapters');
const user2SubjectInput = document.getElementById('user2-subject');
const user2ChaptersInput = document.getElementById('user2-chapters');
const user1SubjectList = document.getElementById('user1-subject-list');
const user2SubjectList = document.getElementById('user2-subject-list');
const user1ScoreEl = document.getElementById('user1-score');
const user2ScoreEl = document.getElementById('user2-score');
const simulateTestBtn = document.getElementById('simulate-test');
const weeklyResetBtn = document.getElementById('weekly-reset');
const testResultEl = document.getElementById('test-result');
const tieBreakersEl = document.getElementById('tie-breakers');

let data = {
  user1: {
    subjects: {},
    totalSubjectPoints: 0,
    score: 0,
  },
  user2: {
    subjects: {},
    totalSubjectPoints: 0,
    score: 0,
  },
  tieBreakers: 0,
};

function loadData() {
  const savedData = localStorage.getItem('studyCompetitionData');
  if (savedData) {
    data = JSON.parse(savedData);
  }
}

function saveData() {
  localStorage.setItem('studyCompetitionData', JSON.stringify(data));
}

function updateSubjectList(userKey, listEl) {
  const subjects = data[userKey].subjects;
  listEl.innerHTML = '';
  for (const [subject, chapters] of Object.entries(subjects)) {
    const li = document.createElement('li');
    li.textContent = \`\${subject}: \${chapters} chapters\`;
    listEl.appendChild(li);
  }
}

function updateScores() {
  user1ScoreEl.textContent = data.user1.score.toFixed(1);
  user2ScoreEl.textContent = data.user2.score.toFixed(1);
  tieBreakersEl.textContent = \`Tie Breakers: \${data.tieBreakers}\`;
}

function calculateTotalSubjectPoints(userKey) {
  const subjects = data[userKey].subjects;
  let total = 0;
  for (const chapters of Object.values(subjects)) {
    total += chapters;
  }
  data[userKey].totalSubjectPoints = total;
}

function addOrUpdateSubject(userKey, subject, chapters) {
  if (chapters < 0) return;
  data[userKey].subjects[subject] = chapters;
  calculateTotalSubjectPoints(userKey);
  saveData();
}

function resetWeeklySubjects() {
  data.user1.subjects = {};
  data.user2.subjects = {};
  data.user1.totalSubjectPoints = 0;
  data.user2.totalSubjectPoints = 0;
  data.tieBreakers = 0;
  testResultEl.textContent = '';
  saveData();
  updateSubjectList('user1', user1SubjectList);
  updateSubjectList('user2', user2SubjectList);
  updateScores();
}

function simulateAITest() {
  // Simulate test scores between 0 and 100 for both users
  const user1TestScore = Math.floor(Math.random() * 101);
  const user2TestScore = Math.floor(Math.random() * 101);

  let resultText = \`AI Test Scores - You: \${user1TestScore}, Friend: \${user2TestScore}. \`;

  // Scoring logic
  let user1ScoreAdd = 0;
  let user2ScoreAdd = 0;

  // Test score comparison
  if (user1TestScore > user2TestScore) {
    user1ScoreAdd += 0.5;
  } else if (user2TestScore > user1TestScore) {
    user2ScoreAdd += 0.5;
  } else {
    // Equal test scores
    user1ScoreAdd += 0.5;
    user2ScoreAdd += 0.5;
  }

  // Subject overall points comparison
  if (data.user1.totalSubjectPoints > data.user2.totalSubjectPoints) {
    user1ScoreAdd += 1;
  } else if (data.user2.totalSubjectPoints > data.user1.totalSubjectPoints) {
    user2ScoreAdd += 1;
  } else {
    // Equal subject points
    user1ScoreAdd += 1;
    user2ScoreAdd += 1;
  }

  // Check for both equal and tie breakers
  if (
    data.user1.totalSubjectPoints === data.user2.totalSubjectPoints &&
    user1TestScore === user2TestScore
  ) {
    if (data.tieBreakers >= 5) {
      user1ScoreAdd = 1.5;
      user2ScoreAdd = 1.5;
      resultText += 'Both scored equally with 5+ tie breakers, rewarded 1.5 points each. ';
      data.tieBreakers = 0; // reset tie breakers after reward
    } else {
      data.tieBreakers++;
      resultText += \`Tie breaker incremented to \${data.tieBreakers}. Need 5 to get 1.5 points each. \`;
    }
  } else {
    // Reset tie breakers if not equal
    data.tieBreakers = 0;
  }

  data.user1.score += user1ScoreAdd;
  data.user2.score += user2ScoreAdd;

  saveData();
  updateScores();
  testResultEl.textContent = resultText;
  tieBreakersEl.textContent = \`Tie Breakers: \${data.tieBreakers}\`;
}

user1Form.addEventListener('submit', (e) => {
  e.preventDefault();
  const subject = user1SubjectInput.value.trim();
  const chapters = parseInt(user1ChaptersInput.value, 10);
  if (subject && !isNaN(chapters) && chapters >= 0) {
    addOrUpdateSubject('user1', subject, chapters);
    updateSubjectList('user1', user1SubjectList);
    user1Form.reset();
  }
});

user2Form.addEventListener('submit', (e) => {
  e.preventDefault();
  const subject = user2SubjectInput.value.trim();
  const chapters = parseInt(user2ChaptersInput.value, 10);
  if (subject && !isNaN(chapters) && chapters >= 0) {
    addOrUpdateSubject('user2', subject, chapters);
    updateSubjectList('user2', user2SubjectList);
    user2Form.reset();
  }
});

simulateTestBtn.addEventListener('click', () => {
  simulateAITest();
});

weeklyResetBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset weekly subject scores? This cannot be undone.')) {
    resetWeeklySubjects();
  }
});

// Initialize
loadData();
updateSubjectList('user1', user1SubjectList);
updateSubjectList('user2', user2SubjectList);
updateScores();
