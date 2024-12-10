import express from "express";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileURLToPath } from "url";
import axios from "axios";

const config = {
  port: process.env.PORT || 6001,
  geminiApiKey: process.env.GEMINI_API_KEY,
  defaultVoice: "en-US-Studio-O",
  defaultLanguage: "en-US",
  maxRetries: 3,
  initialDelay: 2000,
  generationConfig: {
    temperature: 0.3,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 512,
  },
};


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new TextToSpeechClient();
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check for required environment variables
 */
if (!config.geminiApiKey) {
  console.error("Error: GEMINI_API_KEY environment variable is not set");
  process.exit(1);
}

const app = express();

app.use(express.static("."));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "templates", "home.html"));
});

app.get("/ts", (req, res) => {
  res.sendFile(join(__dirname, "templates", "typing_speed.html"));
});

app.get("/cte", (req, res) => {
  res.sendFile(join(__dirname, "templates", "chinese_to_english.html"));
});

app.get("/random_sentence", async (req, res, next) => {
  try {
    let filename = req.query.file;
    if (filename === undefined) {
      filename = Math.floor(Math.random() * 9) + 1;
    }
    const sentencesDir = join(__dirname, "sentences");
    const filePath = join(sentencesDir, `${filename}.txt`);

    if (!existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const lines = readFileSync(filePath, "utf-8").split("\n");
    const totalLines = lines.length;
    if (totalLines === 0) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    let randomLineNumber = Math.floor(Math.random() * totalLines) + 1;
    if (randomLineNumber % 2 === 0) {
      randomLineNumber -= 1;
    }
    const english = lines[randomLineNumber - 1].replace(/^E: /, "").trim();
    const chinese = lines[randomLineNumber].replace(/^C: /, "").trim();
    res.json({ english, chinese });
  } catch (error) {
    next(error);
  }
});

app.post("/texttospeech", async (req, res, next) => {
  try {
    const {
      text,
      voiceType = config.defaultVoice,
      language = config.defaultLanguage,
    } = req.body;

    if (!text) {
      return res.status(400).json({
        status: "error",
        error: "Text is required",
      });
    }

    const request = {
      input: { text },
      voice: {
        languageCode: language,
        name: voiceType,
        ssmlGender: "FEMALE",
      },
      audioConfig: { audioEncoding: "MP3" },
    };

    // 发送 POST 请求到 Google Cloud Text-to-Speech API
    const response = await axios.post("https://texttospeech.googleapis.com/v1/text:synthesize", request, 
      {
      params: {
        key: config.geminiApiKey
      }
    });

    // API 返回的音频内容是 base64 编码的
    const audioContent = Buffer.from(response.data.audioContent, 'base64');

    // Send the audio data directly to the client
    res.send(audioContent);
  } catch (error) {
    next(error);
  }
});

app.post("/chinesetoenglishscore", async (req, res, next) => {
  try {
    const { chinese, english } = req.body;
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: config.generationConfig,
    });
    const prompt = `
      Chinese: "${chinese}"
      English: "${english}"

      Score the translation from Chinese to English based on accuracy, naturalness, and semantic from 1 to 10, and explain the reason why it could get the score, then return the result in the json format below without additional words:

      {
        "score": "the overall score",
        "explanation": "the explanation"
      }`;

    const result = await model.generateContent(prompt);

    const response = await result.response;
    const jsonString = response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const jsonObject = JSON.parse(jsonString);

    console.log(jsonObject);
    res.json({
      status: "success",
      content: jsonObject,
    });
  } catch (error) {
    next(error);
  }
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});