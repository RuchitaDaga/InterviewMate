"use client";

import { useState } from "react";

export default function Home() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [betterAnswer, setBetterAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  async function startInterview() {
    if (!resume.trim() || !jobDescription.trim()) {
      setError("Please enter both your resume and job description.");
      return;
    }

    setLoading(true);
    setError("");
    setQuestion("");
    setAnswer("");
    setFeedback("");
    setScore("");
    setStrengths("");
    setImprovements("");
    setBetterAnswer("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/generate-question",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume,
            job_description: jobDescription,
          }),
        }
      );

      const rawResponse = await response.text();

      if (!response.ok) {
        throw new Error(
          `Failed to generate question: ${rawResponse}`
        );
      }

      if (!rawResponse.trim()) {
        throw new Error("Backend returned an empty response.");
      }

      let data;

      try {
        data = JSON.parse(rawResponse);
      } catch {
        throw new Error(
          `Backend returned invalid JSON: ${rawResponse}`
        );
      }

      if (!data || typeof data.question !== "string") {
        throw new Error(
          "The AI did not return a valid interview question."
        );
      }

      setQuestion(data.question.trim());
    } catch (err) {
      console.error("Question generation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not generate the interview question."
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    const currentAnswer = answer.trim();

    if (!currentAnswer) {
      setError("Please write your answer before submitting.");
      return;
    }

    if (!question.trim()) {
      setError("No interview question is available.");
      return;
    }

    setEvaluating(true);
    setError("");
    setFeedback("");
    setScore("");
    setStrengths("");
    setImprovements("");
    setBetterAnswer("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/evaluate-answer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
            answer: currentAnswer,
          }),
        }
      );

      const rawResponse = await response.text();

      console.log("Backend status:", response.status);
      console.log("Backend response:", rawResponse);

      if (!response.ok) {
        throw new Error(
          `Evaluation failed with status ${response.status}: ${rawResponse}`
        );
      }

      if (!rawResponse.trim()) {
        throw new Error("Backend returned an empty response.");
      }

      let data;

      try {
        data = JSON.parse(rawResponse);
      } catch {
        throw new Error(
          `Backend returned invalid JSON: ${rawResponse}`
        );
      }

      console.log("Parsed backend data:", data);

      if (!data || typeof data !== "object") {
        throw new Error("Backend returned null or invalid data.");
      }

      if (
        !("feedback" in data) ||
        typeof data.feedback !== "string" ||
        !data.feedback.trim()
      ) {
        throw new Error(
          `Backend did not return feedback. Response was: ${rawResponse}`
        );
      }

      const feedbackText = data.feedback.trim();

      /*
       * The AI is responsible for:
       * Score
       * Strengths
       * Improvements
       *
       * Better Answer is intentionally taken from the user's
       * original answer so the AI cannot invent facts.
       */

      const scoreMatch = feedbackText.match(
        /Score:\s*([0-9]+(?:\s*\/\s*10)?)/i
      );

      const strengthsMatch = feedbackText.match(
        /Strengths:\s*([\s\S]*?)(?=\n\s*Improvements:|$)/i
      );

      const improvementsMatch = feedbackText.match(
        /Improvements:\s*([\s\S]*?)(?=\n\s*Better Answer:|$)/i
      );

      const parsedScore = scoreMatch?.[1]
        ? scoreMatch[1].trim().replace(/\s*\/\s*10$/, "")
        : "";

      const parsedStrengths =
        strengthsMatch?.[1]?.trim() || "";

      const parsedImprovements =
        improvementsMatch?.[1]?.trim() || "";

      setScore(parsedScore);
      setStrengths(parsedStrengths);
      setImprovements(parsedImprovements);

      // Safe by design: never let the AI invent the candidate's experience.
      setBetterAnswer(currentAnswer);

      setFeedback(feedbackText);
    } catch (err) {
      console.error("Evaluation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while evaluating your answer."
      );
    } finally {
      setEvaluating(false);
    }
  }

  function formatFeedbackList(text: string) {
    if (!text) {
      return [];
    }

    return text
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) =>
        item
          .replace(/^[-•*]\s*/, "")
          .replace(/^\d+[.)]\s*/, "")
          .trim()
      )
      .filter(Boolean);
  }

  const strengthItems = formatFeedbackList(strengths);
  const improvementItems = formatFeedbackList(improvements);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              InterviewMate
            </h1>

            <p className="mt-1 text-xs text-zinc-500">
              Your private AI interview coach
            </p>
          </div>

          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
            Local AI
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium text-emerald-400">
            PRACTICE WITH PURPOSE
          </p>

          <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Prepare for the interview,
            <span className="block text-zinc-500">
              not just the questions.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400">
            Upload your context, practice realistic questions, and get
            personalized feedback from a private AI interview coach.
          </p>
        </div>

        {/* Resume + Job Description */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
          {/* Resume */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0f] p-6">
            <div className="mb-4">
              <h3 className="font-medium">Your Resume</h3>

              <p className="mt-1 text-sm text-zinc-500">
                Tell InterviewMate about your experience.
              </p>
            </div>

            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume here..."
              className="h-64 w-full resize-none rounded-xl border border-white/10 bg-[#08080a] p-4 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
            />
          </div>

          {/* Job Description */}
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0f] p-6">
            <div className="mb-4">
              <h3 className="font-medium">Job Description</h3>

              <p className="mt-1 text-sm text-zinc-500">
                Add the role you're preparing for.
              </p>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
              placeholder="Paste the job description here..."
              className="h-64 w-full resize-none rounded-xl border border-white/10 bg-[#08080a] p-4 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-auto mt-6 max-w-5xl rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Start Interview */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={startInterview}
            disabled={loading}
            className="rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Generating question..."
              : "Start Interview →"}
          </button>
        </div>

        {/* Question + Answer */}
        {question && (
          <div className="mx-auto mt-12 max-w-5xl">
            {/* Question */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                Interview Question
              </p>

              <h3 className="mt-4 text-xl font-medium leading-8 text-zinc-100">
                {question}
              </h3>
            </div>

            {/* Answer */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d0d0f] p-6">
              <div className="mb-4">
                <h3 className="font-medium">Your Answer</h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Answer as if you were speaking to the interviewer.
                </p>
              </div>

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="h-48 w-full resize-none rounded-xl border border-white/10 bg-[#08080a] p-4 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
              />

              <div className="mt-5 flex justify-end">
                <button
                  onClick={submitAnswer}
                  disabled={evaluating}
                  className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {evaluating
                    ? "Analyzing Answer..."
                    : "Submit Answer →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Feedback */}
        {feedback && (
          <div className="mx-auto mt-12 max-w-5xl">
            <p className="mb-6 text-xs font-medium uppercase tracking-wider text-emerald-400">
              AI Feedback
            </p>

            {/* Score */}
            <div className="rounded-2xl border border-white/10 bg-[#0d0d0f] p-8 text-center">
              <p className="text-sm text-zinc-500">
                Overall Score
              </p>

              <div className="mt-2">
                <span className="text-6xl font-semibold tracking-tight text-white">
                  {score || "—"}
                </span>

                <span className="ml-1 text-xl text-zinc-600">
                  /10
                </span>
              </div>

              <p className="mt-3 text-sm text-zinc-500">
                Based on relevance, clarity, structure, specificity,
                and completeness.
              </p>
            </div>

            {/* Strengths + Improvements */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Strengths */}
              <div className="rounded-2xl border border-emerald-500/10 bg-[#0d0d0f] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    ✓
                  </div>

                  <h3 className="font-medium text-emerald-400">
                    Strengths
                  </h3>
                </div>

                <div className="mt-5 space-y-3">
                  {strengthItems.length > 0 ? (
                    strengthItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-3 text-sm leading-7 text-zinc-300"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">
                      No strengths identified.
                    </p>
                  )}
                </div>
              </div>

              {/* Improvements */}
              <div className="rounded-2xl border border-amber-500/10 bg-[#0d0d0f] p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                    ↑
                  </div>

                  <h3 className="font-medium text-amber-400">
                    Improvements
                  </h3>
                </div>

                <div className="mt-5 space-y-3">
                  {improvementItems.length > 0 ? (
                    improvementItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-3 text-sm leading-7 text-zinc-300"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">
                      No improvements identified.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Better Answer */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d0d0f] p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                  ✦
                </div>

                <h3 className="font-medium text-white">
                  Better Answer
                </h3>
              </div>

              <div className="mt-5 rounded-xl border border-white/5 bg-[#08080a] p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                  {betterAnswer}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}