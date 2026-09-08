import { passages, getRank } from "./data.js";

const $ = selector => document.querySelector(selector);
const state = {
  passage: "", typed: "", duration: 60, startedAt: 0, remaining: 60,
  timerId: null, complete: false, lastFrame: 0
};
let passageDeck = [];
let lastPassage = "";

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function choosePassage() {
  if (passageDeck.length === 0) {
    passageDeck = shuffle(passages);
    if (passageDeck.length > 1 && passageDeck[0] === lastPassage) {
      [passageDeck[0], passageDeck[1]] = [passageDeck[1], passageDeck[0]];
    }
  }
  state.passage = passageDeck.shift() || passages[0];
  lastPassage = state.passage;
}

function renderPassage() {
  const passage = $("#passage");
  passage.replaceChildren();
  [...state.passage].forEach((character, index) => {
    const span = document.createElement("span");
    span.className = "char";
    span.dataset.index = String(index);
    span.textContent = character === " " ? "\u00a0" : character;
    passage.appendChild(span);
  });
  updateCharacterStates();
}

function stats() {
  const typed = [...state.typed];
  const correct = typed.reduce((total, character, index) => total + (character === state.passage[index] ? 1 : 0), 0);
  const elapsedSeconds = state.startedAt ? Math.max((performance.now() - state.startedAt) / 1000, 1) : 0;
  const minutes = elapsedSeconds / 60;
  return {
    correct,
    errors: typed.length - correct,
    total: typed.length,
    wpm: minutes ? Math.round(correct / 5 / minutes) : 0,
    cpm: minutes ? Math.round(typed.length / minutes) : 0,
    accuracy: typed.length ? Math.round(correct / typed.length * 100) : 100
  };
}

function updateMetrics() {
  const result = stats();
  $("#wpm").textContent = String(result.wpm);
  $("#cpm").textContent = String(result.cpm);
  $("#accuracy").textContent = `${result.accuracy}%`;
  $("#errors").textContent = String(result.errors);
  const totalSeconds = Math.ceil(state.remaining);
  $("#timer").textContent = `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
  $("#progress").textContent = `${state.typed.length} / ${state.passage.length}`;
}

function updateCharacterStates() {
  document.querySelectorAll(".char").forEach((element, index) => {
    element.className = "char";
    if (index < state.typed.length) element.classList.add(state.typed[index] === state.passage[index] ? "correct" : "incorrect");
    if (index === state.typed.length && !state.complete) element.classList.add("current");
  });
  updatePassageViewport();
}

function updatePassageViewport() {
  const viewport = $("#passage-viewport");
  const passage = $("#passage");
  const active = passage.querySelector(".current");
  if (!viewport || !passage) return;
  if (!active) {
    passage.style.transform = "translate3d(0, 0, 0)";
    return;
  }

  const viewportWidth = viewport.clientWidth;
  const passageWidth = Math.max(passage.scrollWidth, active.offsetLeft + active.getBoundingClientRect().width + 1);
  const targetPosition = viewportWidth * 0.4;
  const desiredTranslate = targetPosition - active.offsetLeft;
  const minTranslate = Math.min(0, viewportWidth - passageWidth);
  const translate = Math.max(minTranslate, Math.min(0, desiredTranslate));
  passage.style.transform = `translate3d(${translate}px, 0, 0)`;
}

function updateTimeline() {
  const fraction = state.duration ? Math.max(0, Math.min(1, state.remaining / state.duration)) : 1;
  $("#timeline-fill").style.width = `${fraction * 100}%`;
}

function stopTimer() {
  if (state.timerId !== null) window.cancelAnimationFrame(state.timerId);
  state.timerId = null;
  state.lastFrame = 0;
}

function tick(now) {
  if (state.complete || !state.startedAt) return;
  if (!state.lastFrame) state.lastFrame = now;
  const elapsedSeconds = (now - state.startedAt) / 1000;
  state.remaining = Math.max(0, state.duration - elapsedSeconds);
  updateMetrics();
  updateTimeline();
  if (state.remaining <= 0) {
    completeTest();
    return;
  }
  state.timerId = window.requestAnimationFrame(tick);
}

function startTimer() {
  if (state.timerId !== null || state.startedAt || state.complete) return;
  state.startedAt = performance.now();
  state.remaining = state.duration;
  state.timerId = window.requestAnimationFrame(tick);
}

function completeTest() {
  if (state.complete) return;
  state.complete = true;
  if (state.startedAt) state.remaining = Math.max(0, state.duration - (performance.now() - state.startedAt) / 1000);
  stopTimer();
  updateMetrics();
  updateTimeline();
  const result = stats();
  const rank = getRank(result.wpm);
  const payload = { ...result, duration: state.duration, rank: rank.name, timestamp: new Date().toISOString() };
  try { sessionStorage.setItem("dorkey_latest_result", JSON.stringify(payload)); } catch (error) { console.warn("Could not save result:", error); }
  window.location.href = "result.html";
}

function resetTest() {
  stopTimer();
  state.typed = ""; state.startedAt = 0; state.complete = false; state.remaining = state.duration;
  choosePassage(); renderPassage(); updateMetrics(); updateTimeline();
  $("#typing-input").value = "";
  $("#typing-input").focus();
}

function handleInput(event) {
  if (state.complete) return;
  const value = event.target.value.slice(0, state.passage.length);
  event.target.value = value;
  state.typed = value;
  if (state.typed && !state.startedAt) startTimer();
  updateCharacterStates();
  updateMetrics();
  if (state.typed.length === state.passage.length) completeTest();
}

const input = $("#typing-input");
if (input) {
  $("#duration").addEventListener("change", event => { state.duration = Number(event.target.value); resetTest(); });
  $("#restart").addEventListener("click", resetTest);
  $("#passage-wrap").addEventListener("click", () => input.focus());
  input.addEventListener("input", handleInput);
  input.addEventListener("keydown", event => { if (event.key === "Tab") event.preventDefault(); });
  resetTest();
  window.addEventListener("resize", updatePassageViewport);
}
