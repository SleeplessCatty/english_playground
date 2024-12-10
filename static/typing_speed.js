let startTime;
let resultsInterval;
let english;
let chinese;

changeSentence();
document.getElementById("input").value = "";
document.getElementById("input").disabled = true;
document.getElementById("time").innerText = (0.0).toFixed(2);
document.getElementById("wpm").innerText = (0.0).toFixed(2);
document.getElementById("stopButton").disabled = true;
document.getElementById("startButton").disabled = false;

function startTest() {
  clearHighlightText();
  document.getElementById("stopButton").disabled = false;
  document.getElementById("startButton").disabled = true;
  document.getElementById("input").value = "";
  document.getElementById("input").disabled = false;
  document.getElementById("input").addEventListener("input", checkInput);
  document.getElementById("input").focus();
  startTime = new Date().getTime();
  if (resultsInterval) {
    clearInterval(resultsInterval);
  }
  resultsInterval = setInterval(updateResults, 100);
}

function stopTest() {
  document.getElementById("stopButton").disabled = true;
  document.getElementById("startButton").disabled = false;
  clearInterval(resultsInterval);
  document.getElementById("input").removeEventListener("input", checkInput);
  document.getElementById("input").disabled = true;
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    if (document.getElementById("stopButton").disabled) {
      startTest();
    } else {
      stopTest();
    }
    event.preventDefault();
  }
});

function checkInput() {
  highlightText();
  let inputText = document.getElementById("input").value;
  if (inputText === english || inputText.length > english.length) {
    stopTest();
  }
}

function highlightText() {
  let inputText = document.getElementById("input").value;
  let highlightedText = "";
  for (let i = 0; i < english.length; i++) {
    if (i < inputText.length) {
      if (inputText[i] === english[i]) {
        highlightedText += `<span style="color: green;">${english[i]}</span>`;
      } else {
        highlightedText += `<span style="color: red;">${english[i]}</span>`;
      }
    } else {
      highlightedText += english[i];
    }
  }
  document.getElementById("english_sentence").innerHTML = highlightedText;
}

function updateResults() {
  let inputText = document.getElementById("input").value;
  let currentTime = new Date().getTime();
  let timeTaken = (currentTime - startTime) / 1000;
  let wordsPerMinute =
    inputText == "" ? 0 : (inputText.split(" ").length / timeTaken) * 60;
  document.getElementById("time").innerText = timeTaken.toFixed(2);
  document.getElementById("wpm").innerText = wordsPerMinute.toFixed(2);
}

function clearHighlightText() {
  document.getElementById("english_sentence").innerHTML = english;
}

function changeSentence() {
  stopTest();
  fetch("/random_sentence")
    .then((response) => response.json())
    .then((data) => {
      english = data.english;
      chinese = data.chinese;
      document.getElementById("english_sentence").innerText = english;
      document.getElementById("chinese_sentence").innerText = chinese;
      clearInterval(resultsInterval);
      document.getElementById("input").value = "";
      document.getElementById("input").disabled = true;
      document.getElementById("time").innerText = (0.0).toFixed(2);
      document.getElementById("wpm").innerText = (0.0).toFixed(2);
    });
}
