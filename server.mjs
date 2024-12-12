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
    const response = await axios.post(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      request,
      {
        params: {
          key: config.geminiApiKey,
        },
      }
    );

    // API 返回的音频内容是 base64 编码的
    const audioContent = Buffer.from(response.data.audioContent, "base64");

    // 设置正确的响应头
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioContent.length,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
    });

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
      model: "gemini-1.5-flash-8b",
      generationConfig: config.generationConfig,
    });
    const prompt = `
      I will provide a Chinese sentence and its English translation. Please evaluate the translation from the following perspectives:
	    1.	Accuracy (Does the English translation correctly convey the meaning of the Chinese sentence?)
	    2.	Fluency (Is the English translation grammatically correct and natural-sounding?)
	    3.	Cultural Appropriateness (Does the translation take into account cultural nuances and avoid awkward or inappropriate expressions?)
	    4.	Completeness (Does the English translation include all the essential information from the Chinese sentence?)

      For each category, give a score from 0 to 10, where 10 is perfect and 0 is completely unacceptable. Then provide an overall score (the average of the four categories). After scoring, briefly explain why each score was given in plain language, pointing out any strengths or weaknesses in the translation.
      
      This is the Chinese sentence and its English translation:
      Chinese: "${chinese}"
      English: "${english}"
      
      Please respond in the following format:
      {
        "score": "the overall score",
        "explanation": "briefly explain why the overall score was given"
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
