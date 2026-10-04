# InterviewMate

**Your private AI interview coach**

InterviewMate is a local AI-powered interview practice tool built for students preparing for internships and placements.

It uses an open-weight AI model running locally to generate personalized interview questions and evaluate candidate answers without requiring resume or interview data to be sent to a third-party cloud AI provider.

## The Problem

Interview preparation often becomes repetitive and generic.

Students may practice random interview questions, but they don't always receive feedback connected to their resume and the role they are targeting.

InterviewMate was built for a friend preparing for internships and placements who needed a simple way to practice realistic interview questions and receive immediate feedback.

## How It Works

1. Add your resume.
2. Add the job description.
3. InterviewMate generates a relevant interview question.
4. Answer the question as if you were speaking to an interviewer.
5. The AI evaluates the response.
6. Receive:

   * Score
   * Strengths
   * Improvements
   * A safe, grounded version of your answer

## Why Open Innovation?

InterviewMate uses **Gemma 3:1B**, an open-weight model running locally through Ollama.

Running the model locally helps keep the candidate's resume and interview responses within their own environment instead of requiring a hosted AI API.

Using an open-weight model also makes the system easier to experiment with, customize, and build upon using open AI technology.

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Python
* FastAPI
* Pydantic

### AI

* Gemma 3:1B
* Ollama
* Local inference

## Architecture

```text
Next.js Frontend
       |
       | HTTP API
       ↓
FastAPI Backend
       |
       ↓
Ollama
       |
       ↓
Gemma 3:1B
```

## Running Locally

### Requirements

* Node.js
* Python 3.12+
* Ollama

Install the model:

```bash
ollama pull gemma3:1b
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn ollama pydantic
python -m uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## Privacy

InterviewMate is designed around local AI inference.

Resume content and interview answers are processed through the locally running Ollama/Gemma setup rather than requiring a hosted AI API.

## Future Improvements

* Multiple interview sessions
* 5-question mock interviews
* Interview history
* Role-specific question categories
* Progress tracking
* Voice-based interview practice
* Support for additional open-weight models
* Improved grounded answer refinement

## Hacktoberfest 2026

Built for the DEV Weekend Challenge:

**Build for a Friend**

`#devchallenge #weekendchallenge #hf26challenge`
