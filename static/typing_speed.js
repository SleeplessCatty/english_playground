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
  const number = document.getElementById("changeSource").value;
  fetch("/random_sentence?file=" + number)
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

function speakEnglish() {
  const english = document.getElementById("english_sentence").innerText;

  // 使用 XMLHttpRequest 来处理音频流
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/texttospeech", true);
  xhr.responseType = "arraybuffer";
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function () {
    if (xhr.status === 200) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // 将响应数据转换为音频数据
      audioContext
        .decodeAudioData(xhr.response)
        .then(function (buffer) {
          // 创建音频源
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);

          // 播放音频
          source.start(0);

          // 播放完成后清理
          source.onended = function () {
            source.disconnect();
            audioContext.close();
          };
        })
        .catch(function (error) {
          console.error("Error decoding audio data:", error);

          // 如果解码失败，尝试使用传统的 Audio 元素播放
          const blob = new Blob([xhr.response], { type: "audio/mpeg" });
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);

          audio
            .play()
            .then(() => {
              audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
              };
            })
            .catch((e) => {
              console.error("Fallback audio playback failed:", e);
              URL.revokeObjectURL(audioUrl);
            });
        });
    } else {
      console.error("Server returned error:", xhr.status);
    }
  };

  xhr.onerror = function () {
    console.error("Request failed");
  };

  xhr.send(JSON.stringify({ text: english }));
}

// 添加按钮点击效果
document.querySelectorAll(".nav-icon-button").forEach((button) => {
  button.addEventListener("click", function () {
    this.classList.add("clicked");
    setTimeout(() => {
      this.classList.remove("clicked");
    }, 400); // 与 CSS 过渡时间匹配
  });
});
