const express = require('express');
const app = express();
const PORT = 3000;
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data")
// const ffmpeg = require("fluent-ffmpeg");
// const mic = require("mic");
const path = require('path');
var cors = require('cors');
const multer = require("multer")
// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'temp/')
    }, // Ensure this folder exists
    filename: (req, file, cb) => {
        cb(null, "voice.mp3"); // Save file as "recording.mp3"
    }
});

const storageAudio = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'temp/')
    }, // Ensure this folder exists
    filename: (req, file, cb) => {
        cb(null, "test.WAV"); // Save file as "recording.mp3"
    }
});

const upload = multer({
    storage
});

const uploadAudio = multer({
    storage: storageAudio
});

app.use(express.static(path.join(__dirname, "public")));

app.use(cors())
let mediaRecorder;
app.get('/', (req, res) => {
    // press();
    res.render('speech.ejs', {
        title: 'My App',
        message: '您好'
    });
});

app.post('/stop-recording', (req, res) => {
    if (mediaRecorder && mediaRecorder.state != "inactive") {
        mediaRecorder.stop();
    }

    console.log("Recording stopped and saved.");
    res.json({
        success: true
    });
})

app.post('/transcribe', upload.single("audio"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: "No file uploaded."
        });
    }

    const filePath = path.join(__dirname, "temp", req.file.filename);
    const text = await transcribeAudio();
    console.log(text, 'transcribed text')
    const RasaResponse = await chatText(text);
    console.log(RasaResponse)
    console.log(typeof (RasaResponse))
    return res.json(RasaResponse);
})

app.post('/inputText', upload.single("audio"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: "No file uploaded."
        });
    }

    const filePath = path.join(__dirname, "temp", req.file.filename);
    const text = await transcribeAudio();
    return res.json(text);
})

// async function press() {
//     const audioFileName = 'recorded.mp3'
//     await recordAudio(audioFileName);
//     const transcription = await transcribeAudio(audioFileName);
//     const RasaResponse = await chatText(transcription);

//     speak(RasaResponse[0].text)
// }
app.post('/transcribeAudio', uploadAudio.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'No file uploaded'
        });
    }
    const form = new FormData();
    const params = {
        encode: 'true',
        task: 'transcribe',
        language: 'en',
        initial_prompt: '',
        output: 'txt',
        // Add other parameters here
    };
    for (const key in params) {
        form.append(key, params[key]);
    }
    const filePath = req.file.path
    // Append the file to the form data

    form.append('audio_file', fs.createReadStream(filePath), {
        filename: req.file.filename,
        contentType: 'audio/wav' // Set the MIME type for the file
    });

    var res
    // Send the POST request using Axios
    await axios.post('http://localhost:'+req.body.port+'/asr', form, {
            headers: {
                ...form.getHeaders(), // Include the appropriate headers for multipart/form-data
            },
        })
        .then(response => {res = response.data})
        .catch(error => {
            // Handle errors
            if (error.response) {
                console.error('Response error:', error.response.data);
            } else if (error.request) {
                console.error('Request error:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
        });
        console.log(res)
        return res
});

async function transcribeAudio() {
    console.log('transcribinggg')
    const form = new FormData();
    const params = {
        encode: 'true',
        task: 'transcribe',
        language: 'en',
        initial_prompt: 'initial_prompt',
        output: 'txt',
        // Add other parameters here
    };
    for (const key in params) {
        form.append(key, params[key]);
    }
    const filePath = path.resolve(__dirname, 'temp', 'voice.mp3');
    // Append the file to the form data
    form.append('audio_file', fs.createReadStream(filePath), {
        filename: 'voice.mp3',
        contentType: 'audio/mpeg' // Set the MIME type for the file
    });

    var res
    // Send the POST request using Axios
    await axios.post('http://localhost:9000/asr', form, {
            headers: {
                ...form.getHeaders(), // Include the appropriate headers for multipart/form-data
            },
        })
        .then(response => {
            res = response.data;
        })
        .catch(error => {
            // Handle errors
            if (error.response) {
                console.error('Response error:', error.response.data);
            } else if (error.request) {
                console.error('Request error:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
        });

    console.log(res)
    return res
};

async function chatText(text) {
    // console.log(boom, "boommm")
    const userData = {
        sender: "test2",
        message: text
    }
    var res
    // Send the POST request using Axios
    await axios.post('http://127.0.0.1:5005/webhooks/rest/webhook', userData)
        .then(response => {
            // console.log("response", response)
            res = response.data;
        })
        .catch(error => {
            // Handle errors
            if (error.response) {
                console.error('Response error:', error.response.data);
            } else if (error.request) {
                console.log(error)
                console.error('Request error:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
        });
    // console.log(res.text)
    // console.log(res, "response")
    return res
};


app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    else
        console.log("Error occurred, server can't start", error);
});