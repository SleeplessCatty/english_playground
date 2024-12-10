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
    inputElement.focus();
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
    document.getElementById("english-input").focus();
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
    document.getElementById("english-input").focus();
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
    fetch("/texttospeech", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text: english,
        }),
    })
    .then(response => response.blob())
    .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play()
            .then(() => {
                // Clean up the URL after playing
                audio.onended = () => URL.revokeObjectURL(audioUrl);
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                URL.revokeObjectURL(audioUrl);
            });
    })
    .catch(error => {
        console.error('Error fetching audio:', error);
    });
}
