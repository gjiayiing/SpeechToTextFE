function playAudio() {

    const speechSynth = window.speechSynthesis;
    const enteredText = "您好"

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

    console.log(textSpeaks, 'speaking')
    if('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textSpeak);
    const voices = speechSynthesis.getVoices();
    // console.log(voices, 'voice')
    utterance.voice = voices[0];

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
        });
        statusText.textContent = "Processing audio...";
        speak("boop")
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

    // rec.stop()

    console.log("Recording stopped and saved.");

}