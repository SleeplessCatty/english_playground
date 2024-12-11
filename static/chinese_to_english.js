document.getElementById("english-input").addEventListener("input", updateCheckButtonState);
document.getElementById("english_sentence").style.display = "none";
updateCheckButtonState(); // Initial state
changeSentence();

function updateCheckButtonState() {
    const inputText = document.getElementById("english-input").value.trim();
    const checkButton = document.getElementById("compButton");
    checkButton.disabled = inputText === "";
}

function changeSentence() {
    const inputElement = document.getElementById("english-input");
    inputElement.value = "";
    document.getElementById("english_sentence").style.display = "none";
    document.getElementById("showButton").innerText = "Show Result";
    document.getElementById("score").innerText = "";
    document.getElementById("explanation").innerText = "";
    updateCheckButtonState();
    
    const number = document.getElementById("changeSource").value;
    fetch("/random_sentence?file=" + number)
        .then((response) => response.json())
        .then((data) => {
            chinese = data.chinese;
            document.getElementById("chinese_sentence").innerText = chinese;
            english = data.english;
            document.getElementById("english_sentence").innerText = english;
        });
}

function check() {
    let inputText = document.getElementById("english-input").value;
    inputText = inputText.trim();
    if (inputText == "") {
        return;
    }
    const chinese = document.getElementById("chinese_sentence").innerText;

    fetch("/chinesetoenglishscore", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            chinese: chinese,
            english: inputText
        }),
    })
    .then(response => response.json())
    .then((data) => {
        content = data.content;
        document.getElementById("score").innerText = content.score;
        document.getElementById("explanation").innerText = content.explanation;
    })
    .catch(error => {
        console.error('Error fetching audio:', error);
    });
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
    xhr.open('POST', '/texttospeech', true);
    xhr.responseType = 'arraybuffer';
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status === 200) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 将响应数据转换为音频数据
            audioContext.decodeAudioData(xhr.response)
                .then(function(buffer) {
                    // 创建音频源
                    const source = audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(audioContext.destination);
                    
                    // 播放音频
                    source.start(0);
                    
                    // 播放完成后清理
                    source.onended = function() {
                        source.disconnect();
                        audioContext.close();
                    };
                })
                .catch(function(error) {
                    console.error('Error decoding audio data:', error);
                    
                    // 如果解码失败，尝试使用传统的 Audio 元素播放
                    const blob = new Blob([xhr.response], { type: 'audio/mpeg' });
                    const audioUrl = URL.createObjectURL(blob);
                    const audio = new Audio(audioUrl);
                    
                    audio.play()
                        .then(() => {
                            audio.onended = () => {
                                URL.revokeObjectURL(audioUrl);
                            };
                        })
                        .catch(e => {
                            console.error('Fallback audio playback failed:', e);
                            URL.revokeObjectURL(audioUrl);
                        });
                });
        } else {
            console.error('Server returned error:', xhr.status);
        }
    };

    xhr.onerror = function() {
        console.error('Request failed');
    };

    xhr.send(JSON.stringify({ text: english }));
}
