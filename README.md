# English Playground

An interactive web application for English language learning, featuring a clean, minimalist interface focused on typing practice and translation exercises.

## Features

- **Typing Speed Test**: Practice typing speed and accuracy with English sentences
- **Chinese to English Translation**: Improve translation skills with interactive exercises
- **Text-to-Speech**: Listen to correct English pronunciations using Google Cloud TTS
- **AI-Powered Content**: Generate dynamic content using Google Gemini AI
- **Minimalist Design**: Distraction-free interface focused on learning

## Prerequisites

- Node.js
- Google Cloud Text-to-Speech API credentials
- Google Gemini API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/english_playground.git
   cd english_playground
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   export GEMINI_API_KEY=your_gemini_api_key
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:6001
   ```

3. Choose your learning activity:
   - **Typing Speed Test**: Focus on typing practice in a distraction-free environment
   - **Translation Test**: Practice Chinese to English translation with instant feedback

## Project Structure

- `server.mjs`: Main server file with API endpoints and business logic
- `templates/`: HTML templates for the web interface
  - `home.html`: Clean landing page with activity selection
  - `typing_speed.html`: Minimalist typing practice interface
  - `chinese_to_english.html`: Focused translation practice interface
- `static/`: Static assets (CSS, JavaScript, images)
- `sentences/`: Text data for exercises

## Dependencies

- @google-cloud/text-to-speech: ^5.0.1
- @google/generative-ai: ^0.21.0
- axios: ^1.7.9
- express: ^4.21.2

## License

This project is licensed under the ISC License.