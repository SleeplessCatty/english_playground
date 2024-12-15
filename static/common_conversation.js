changeSentence();

let chapters = [];
let currentChapter = null;
let currentSection = null;
let currentSentenceIndex = 0;  // 添加变量来跟踪当前句子索引

// 初始化加载数据
fetch('/static/common/8000.json')
    .then(response => response.json())
    .then(data => {
        chapters = data;
        initializeChapters();
    });

// 初始化章节下拉列表
function initializeChapters() {
    const chapterSelect = document.getElementById('chapterSelect');
    chapters.forEach((chapter, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = chapter.title;
        chapterSelect.appendChild(option);
    });
    // 默认选择第一章节
    if (chapters.length > 0) {
        chapterSelect.value = "0";
        updateSections();
    }
}

// 更新小节下拉列表
function updateSections() {
    const chapterIndex = document.getElementById('chapterSelect').value;
    const sectionSelect = document.getElementById('sectionSelect');
    
    // 清空现有选项
    sectionSelect.innerHTML = '';
    
    if (chapterIndex === '') return;
    
    currentChapter = chapters[chapterIndex];
    currentChapter.sections.forEach((section, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = section.sub_title;
        sectionSelect.appendChild(option);
    });

    // 默认选择第一小节
    if (currentChapter.sections.length > 0) {
        sectionSelect.value = "0";
        changeSentence();
    }
}

function changeSentence() {
    document.getElementById("english_sentence").style.display = "none";
    document.getElementById("showButton").innerText = "Show Result";

    const chapterIndex = document.getElementById('chapterSelect').value;
    const sectionIndex = document.getElementById('sectionSelect').value;
    
    if (chapterIndex === '' || sectionIndex === '') {
        document.getElementById("chinese_sentence").innerText = '请选择章节和小节';
        document.getElementById("english_sentence").innerText = '';
        return;
    }

    const section = chapters[chapterIndex].sections[sectionIndex];
    const sentences = section.content;
    
    // 如果切换了章节或小节，重置句子索引
    if (currentChapter !== chapters[chapterIndex] || 
        currentSection !== section) {
        currentSentenceIndex = 0;
        currentChapter = chapters[chapterIndex];
        currentSection = section;
    }
    
    // 获取当前句子并更新索引
    const sentence = sentences[currentSentenceIndex];
    currentSentenceIndex = (currentSentenceIndex + 1) % sentences.length;
    
    document.getElementById("chinese_sentence").innerText = sentence.cn;
    document.getElementById("english_sentence").innerText = sentence.en;
}

function showResult() {
  const displayValue =
    document.getElementById("english_sentence").style.display;
  if (displayValue == "none") {
    document.getElementById("english_sentence").style.display = "block";
    document.getElementById("showButton").innerText = "Hide Result";
  } else {
    document.getElementById("english_sentence").style.display = "none";
    document.getElementById("showButton").innerText = "Show Result";
  }
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
