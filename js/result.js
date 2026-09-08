import { getRank } from "./data.js";

const empty = document.querySelector("#empty-result");
const content = document.querySelector("#result-content");
let result = null;
try { result = JSON.parse(sessionStorage.getItem("dorkey_latest_result") || "null"); } catch (error) { console.warn("Invalid saved result:", error); }

if (!result || typeof result.wpm !== "number") {
  empty.hidden = false;
  content.hidden = true;
} else {
  const rank = getRank(result.wpm);
  document.querySelector("#result-wpm").innerHTML = `${result.wpm}<span> WPM</span>`;
  document.querySelector("#result-rank").textContent = rank.name;
  document.querySelector("#rank-description").textContent = rank.description;
  document.querySelector("#result-cpm").textContent = result.cpm;
  document.querySelector("#result-accuracy").textContent = `${result.accuracy}%`;
  document.querySelector("#result-errors").textContent = result.errors;
  document.querySelector("#result-duration").textContent = `${result.duration}s`;
  document.querySelector("#result-date").textContent = new Date(result.timestamp).toLocaleDateString();
}
