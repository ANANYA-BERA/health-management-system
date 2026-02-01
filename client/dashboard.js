const username = localStorage.getItem("username");

const headerText = document.querySelector(".main-header h2");

if (username) {
  headerText.innerText = `Hello ${username}`;
} else {
  headerText.innerText = "Hello User";
}



/********************************
  1️⃣ DUMMY HEALTH DATA (STATIC)
*********************************/

const healthData = {
  steps: 5095,
  calories: 350,
  temperature: 98.6,
  heartRate: 65
};

// Show default card data
document.querySelector(".card:nth-child(1) p").innerText = healthData.steps;
document.querySelector(".card:nth-child(2) p").innerText = healthData.calories;
document.querySelector(".card:nth-child(3) p").innerText = healthData.temperature + " F";
document.querySelector(".card:nth-child(4) p").innerText = healthData.heartRate + " bpm";


/********************************
  2️⃣ GOAL → UNIT & CARD MAPPING
*********************************/

const cardsContainer = document.querySelector(".cards");

// Default card types (already in HTML)
const defaultCardTypes = ["stepsCount", "calories", "temperature", "heartRate"];

// Goal → Label + Unit + Value Logic
const goalConfig = {
  stepsCount: { label: "Steps Count", unit: "K steps", value: () => healthData.steps },
  calories: { label: "Calories Burned", unit: "kcal", value: () => healthData.calories },
  temperature: { label: "Body Temperature", unit: "°F", value: () => healthData.temperature },
  heartRate: { label: "Heart Rate", unit: "bpm", value: () => healthData.heartRate },
  waterIntake: { label: "Water Intake", unit: "L", value: () => 0 },
  caloriesConsumed: { label: "Calories Consumed", unit: "kcal", value: () => 0 },
  workout: { label: "Workout", unit: "min", value: () => 0 },
  sleepSchedule: { label: "Sleep Schedule", unit: "hrs", value: () => 0 },
  caloriesConsumed: { label: "Calories Consumed", unit: "kcal", value: () => 0 }
};


/********************************
  3️⃣ GOALS SYSTEM
*********************************/

const goalNameSelect = document.getElementById("goalName");
const goalDescInput  = document.getElementById("goalDesc");
const goalBox        = document.getElementById("goal-box");

const addPopup    = document.getElementById("goalPopup");
const deletePopup = document.getElementById("deletePopup");

let goals = [];
let deleteIndex = null;


/* ---------- POPUP CONTROL ---------- */

function openGoalPopup() {
  addPopup.style.display = "flex";
}

function closeGoalPopup() {
  addPopup.style.display = "none";
}

function openDeletePopup(index) {
  deleteIndex = index;
  deletePopup.style.display = "flex";
}

function closeDeletePopup() {
  deletePopup.style.display = "none";
  deleteIndex = null;
}


/* ---------- ADD GOAL ---------- */

function addGoal() {
  const selectedType = goalNameSelect.value;
  const selectedText =
    goalNameSelect.options[goalNameSelect.selectedIndex]?.text || "";

  if (!selectedType) {
    alert("Please select a goal name!");
    return;
  }

  const targetValue = parseFloat(goalDescInput.value);

  if (!targetValue || targetValue <= 0) {
    alert("Please enter a valid target value!");
    return;
  }

  // Prevent duplicate goals
  const exists = goals.some(g => g.type === selectedType);
  if (exists) {
    alert("This goal already exists!");
    return;
  }

  const config = goalConfig[selectedType];

  goals.push({
    type: selectedType,
    name: selectedText,
    target: targetValue,
    unit: config.unit
  });

  saveGoals();
  renderGoals();
  renderDynamicCards();
  updateProgress();

  // Reset fields
  goalNameSelect.selectedIndex = 0;
  goalDescInput.value = "";
  closeGoalPopup();
}


/* ---------- DELETE GOAL ---------- */

function confirmDelete() {
  if (deleteIndex !== null) {
    goals.splice(deleteIndex, 1);
    saveGoals();
    renderGoals();
    renderDynamicCards();
    updateProgress();
  }
  closeDeletePopup();
}


/* ---------- RENDER GOALS LIST ---------- */

function renderGoals() {
  goalBox.innerHTML = "";

  if (goals.length === 0) {
    goalBox.innerHTML = `<li style="opacity:0.6;">No goals added yet</li>`;
    return;
  }

  goals.forEach((g, index) => {
    const li = document.createElement("li");
    li.className = "goal-item";

    li.innerHTML = `
      <span class="goal-text">
        <strong>${g.name}</strong>
        <small>Target: ${g.target} ${g.unit}</small>
      </span>
      <i class="fa-solid fa-trash delete-icon"></i>
    `;

    li.querySelector(".delete-icon").onclick = () => openDeletePopup(index);

    goalBox.appendChild(li);
  });
}


/********************************
  4️⃣ DYNAMIC CARDS LOGIC
*********************************/

function renderDynamicCards() {
  // Remove old dynamic cards
  document.querySelectorAll(".dynamic-card").forEach(card => card.remove());

  goals.forEach(goal => {
    // Create card only if not default card
    if (!defaultCardTypes.includes(goal.type)) {
      const config = goalConfig[goal.type];

      const card = document.createElement("div");
      card.className = "card dynamic-card";

      card.innerHTML = `
        <h4>${config.label}</h4>
        <p>${config.value()} ${goal.unit}</p>
      `;

      cardsContainer.appendChild(card);
    }
  });
}


/********************************
  5️⃣ STORAGE (LOCAL STORAGE)
*********************************/

function saveGoals() {
  localStorage.setItem("goalsJSON", JSON.stringify(goals));
}

function loadGoals() {
  const saved = localStorage.getItem("goalsJSON");
  goals = saved ? JSON.parse(saved) : [];
  renderGoals();
  renderDynamicCards();
  updateProgress();
}

loadGoals();


/********************************
  6️⃣ PROGRESS BAR LOGIC
*********************************/

function updateProgress() {
  let progress = 0;

  // Only calculate progress using steps goal (simple logic)
  const stepsGoal = goals.find(g => g.type === "stepsCount");

  if (stepsGoal && stepsGoal.target > 0) {
    progress = (healthData.steps / stepsGoal.target) * 100;
  }

  progress = Math.min(Math.round(progress), 100);

  const barFill = document.querySelector(".bar-fill");
  const percentText = document.querySelector(".progress-bar per");

  barFill.style.width = progress + "%";
  percentText.innerText = progress + "%";
}
