from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ollama import chat

app = FastAPI(title="InterviewMate API")


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Request Models
# =========================

class InterviewRequest(BaseModel):
    resume: str
    job_description: str


class AnswerRequest(BaseModel):
    question: str
    answer: str


# =========================
# Home
# =========================

@app.get("/")
def home():
    return {
        "message": "InterviewMate backend is running!"
    }


# =========================
# Generate Interview Question
# =========================

@app.post("/generate-question")
def generate_question(request: InterviewRequest):

    if not request.resume.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume cannot be empty."
        )

    if not request.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty."
        )

    prompt = f"""
You are an AI interview coach.

Create ONE realistic interview question based on the candidate's resume
and the job description.

Candidate Resume:
{request.resume}

Job Description:
{request.job_description}

Rules:
- Return ONLY ONE interview question.
- No explanation.
- No answer.
- No headings.
- No reasoning.
- Do not say "Here is the question".
"""

    response = chat(
        model="gemma3:1b",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    question = response["message"]["content"].strip()

    if not question:
        raise HTTPException(
            status_code=500,
            detail="AI did not generate a question."
        )

    return {
        "question": question
    }


# =========================
# Evaluate Interview Answer
# =========================

@app.post("/evaluate-answer")
def evaluate_answer(request: AnswerRequest):

    question = request.question.strip()
    answer = request.answer.strip()

    # Never allow an empty answer to reach the AI.
    if not question:
        raise HTTPException(
            status_code=400,
            detail="Interview question is missing."
        )

    if not answer:
        raise HTTPException(
            status_code=400,
            detail="Please provide an answer before submitting."
        )

    prompt = f"""
You are an honest and strict interview evaluator.

Interview Question:
{question}

Candidate Answer:
{answer}

Evaluate ONLY the candidate's answer.

IMPORTANT TRUTH RULE:
The candidate's answer is the ONLY source of facts.

Never invent or assume:
- projects
- companies
- technologies
- programming concepts
- algorithms
- libraries
- responsibilities
- examples
- numbers
- achievements
- results
- outcomes

STRENGTHS:
Mention only strengths that are actually present in the candidate's answer.

IMPROVEMENTS:
Give practical suggestions for improving the answer.
If something is missing, say that it is missing.
Do NOT add missing information to Better Answer.

BETTER ANSWER:
Rewrite ONLY the candidate's existing answer.

You may:
- fix grammar
- improve sentence structure
- improve clarity
- remove repetition
- improve professional wording

You MUST NOT:
- add new facts
- add examples
- add technologies
- add algorithms
- add projects
- add numbers
- add achievements
- add responsibilities
- add outcomes
- assume technical knowledge

If the answer is short, keep the Better Answer short.

Return EXACTLY this format:

Score:
<number>/10

Strengths:
- <strength from the original answer>
- <strength from the original answer>

Improvements:
- <specific improvement>
- <specific improvement>

Better Answer:
<lightly edited version of the original answer>

Do not add any other sections.
"""

    response = chat(
        model="gemma3:1b",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    ai_response = response["message"]["content"].strip()

    if not ai_response:
        raise HTTPException(
            status_code=500,
            detail="AI did not return feedback."
        )

    return {
        "feedback": ai_response
    }