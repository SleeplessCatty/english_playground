# English Playground

A web-based application for English learning and typing practice, featuring text-to-speech capabilities and typing speed measurement.

## Features

- Text-to-speech conversion using Google Cloud TTS
- AI-powered content generation using Google Gemini
- Typing speed measurement and practice
- Interactive web interface

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

## Project Structure

- `server.mjs`: Main server file containing API endpoints and business logic
- `templates/`: HTML templates for the web interface
- `static/`: Static assets (CSS, JavaScript, images)
- `sentences/`: Contains text data for the application

## Dependencies

- @google-cloud/text-to-speech: ^5.0.1
- @google/generative-ai: ^0.21.0
- axios: ^1.7.9
- express: ^4.21.2

## License

This project is licensed under the Apache-2.0 license.