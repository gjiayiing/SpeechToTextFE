function playAudio() {

    const speechSynth = window.speechSynthesis;
    // const enteredText = "Certainly! What is the sensor ID"
    const enteredText = "NS_1"
    // if (!speechSynth.speaking &&
    //     !enteredText.trim().length) {
    //     error.textContent = `Nothing to Convert! 
    //     Enter text in the text area.`
    // }

    if (!speechSynth.speaking && enteredText.trim().length) {
        // error.textContent = "";
        const newUtter =
            new SpeechSynthesisUtterance(enteredText);
        speechSynth.speak(newUtter);
        // convertBtn.textContent = "Sound is Playing..."
    }

    setTimeout(() => {
        convertBtn.textContent = "Play Converted Sound"
    }, 5000);

}
let recording = false;
let mediaRecorder;
let audioChunks = [];

function speak(textSpeak) {
    // textSpeak =  "I'm sorry I didn't understand you. Could you rephrase the question again?"
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textSpeak);
        const voices = speechSynthesis.getVoices();
        utterance.voice = voices[1];

        speechSynthesis.speak(utterance);
    }

}
async function sendAudioToServer(audioBlob) {
    const statusText = document.getElementById("textRecord");
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.mp3');

    try {
        const response = await fetch('/transcribe', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                data.forEach(message => {
                    speak(message.text)
                })
            })
        statusText.textContent = "Processing audio...";
    } catch (error) {
        console.error("Error:", error);
        statusText.textContent = "An error occurred.";
    }
}

function handlerFunction(stream) {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    }
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
            type: 'audio/mp3'
        });
        sendAudioToServer(audioBlob)
    }
    mediaRecorder.start();
}

async function recordAudio() {
    const statusText = document.getElementById('textRecord');
    audioChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        }) //prompts user for permission to use audio device
        .then(stream => {
            statusText.textContent = "Recording audio...";
            handlerFunction(stream)
        })
}

async function stopRecordAudio() {
    if (mediaRecorder && mediaRecorder.state != "inactive") {
        console.log("stop")
        mediaRecorder.stop();
    }
    console.log("Recording stopped and saved.");

}

async function sendAudioToServerChat(audioBlob) {
    const statusText = document.getElementById("textRecord");
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.mp3');

    try {
        const response = await fetch('/inputText', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                send(data)
                // var link = document.getElementById('my-link');
                // link.click()
                // data.forEach(message => {
                //     speak(message.text)
                // })
            })
        statusText.textContent = "Processing audio...";
    } catch (error) {
        console.error("Error:", error);
        statusText.textContent = "An error occurred.";
    }
}


function handlerFunctionChat(stream) {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    }
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
            type: 'audio/mp3'
        });
        sendAudioToServerChat(audioBlob)
    }
    mediaRecorder.start();
}

async function recordAudioChat() {
    console.log('testing')
    // const statusText = document.getElementById('textRecord');
    // audioChunks = [];
    // const stream = await navigator.mediaDevices.getUserMedia({
    //         audio: true
    //     }) //prompts user for permission to use audio device
    //     .then(stream => {
    //         statusText.textContent = "Recording audio...";
    //         handlerFunctionChat(stream)
    //     })
}

async function stopRecordAudioChat() {
    if (mediaRecorder && mediaRecorder.state != "inactive") {
        console.log("stop")
        mediaRecorder.stop();
    }
    console.log("Recording stopped and saved.");

}