"use client";

import { FormEvent, useMemo, useState } from "react";

type ChoiceQuestion = {
  id: number;
  type: "choice";
  question: string;
  options: string[];
  correct: number[];
};

type TextQuestion = {
  id: number;
  type: "text";
  question: string;
  correct: string;
  placeholder: string;
  helper: string;
};

type Question = ChoiceQuestion | TextQuestion;

const QUESTIONS: Question[] = [
  {
    id: 1,
    type: "choice",
    question: "Что Андрюша купит, когда мы гуляем из кофе?",
    options: ["Бабл ти", "Эспрессо тоник", "Лимонад", "Фууууу, это же всё отстой"],
    correct: [1],
  },
  {
    id: 2,
    type: "choice",
    question: "Что Андрюша любит больше?",
    options: [
      "Корейские дорамы",
      "Мультики 2000-х",
      "Ониме",
      "Конечно же смотреть мои сериалы!! Какие вопросы??",
    ],
    correct: [3],
  },
  {
    id: 3,
    type: "text",
    question: "Напиши буквами, в какое место Андрюша хотел попасть 2 лета подряд — и только недавно у него получилось.",
    correct: "ПАТРОКЛ",
    placeholder: "Твоой ответ",
    helper: "Подсказка: семь букв",
  },
  {
    id: 4,
    type: "choice",
    question: "Какого чела Андрюша чаще всего поёт?",
    options: ["Сергей Жуков", "Лизер", "Мияги", "Драгни"],
    correct: [3],
  },
  {
    id: 5,
    type: "choice",
    question: "Является ли Андрюша кринжом?",
    options: ["Да", "Нет!!"],
    correct: [1],
  },
  {
    id: 6,
    type: "choice",
    question: "И последний, самый важный вопрос. Любишь ли ты Андрюшу?",
    options: ["Конечно", "Да!!! Он же ЛУЧШИИИИЙ", "Обожаю его!!!"],
    correct: [0, 1, 2],
  },
];

type Answer = number | string;

function normalizeText(value: string) {
  return value.toUpperCase().replace(/[^А-ЯA-ZЁ]/g, "");
}

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" aria-hidden="true">
      <path d="M18 1.5c.6 9.2 1.3 11.6 4.5 14.5 2.2 2.1 4.8 3.1 12 4-7.2.9-9.8 1.9-12 4-3.2 2.9-3.9 5.3-4.5 14.5-.6-9.2-1.3-11.6-4.5-14.5-2.2-2.1-4.8-3.1-12-4 7.2-.9 9.8-1.9 12-4C16.7 13.1 17.4 10.7 18 1.5Z" />
    </svg>
  );
}

function Heart({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 42 38" aria-hidden="true">
      <path d="M21 35.1S3.2 24.3 1.7 12.5C.8 5.9 5.4 1.4 11 1.4c4.7 0 7.9 2.7 10 6.1 2.1-3.4 5.3-6.1 10-6.1 5.6 0 10.2 4.5 9.3 11.1C38.8 24.3 21 35.1 21 35.1Z" />
    </svg>
  );
}

export default function Home() {
  const [step, setStep] = useState(-1);
  const [selected, setSelected] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [showError, setShowError] = useState(false);
  const [wrongChoice, setWrongChoice] = useState<number | null>(null);
  const [wrongAttempt, setWrongAttempt] = useState(0);

  const isIntro = step === -1;
  const isResult = step === QUESTIONS.length;
  const question = !isIntro && !isResult ? QUESTIONS[step] : null;

  const score = useMemo(() => {
    return QUESTIONS.reduce((total, item) => {
      const answer = answers[item.id];
      if (item.type === "text") {
        return total + (typeof answer === "string" && normalizeText(answer) === item.correct ? 1 : 0);
      }
      return total + (typeof answer === "number" && item.correct.includes(answer) ? 1 : 0);
    }, 0);
  }, [answers]);

  const percentage = Math.round((score / QUESTIONS.length) * 100);

  function startQuiz() {
    setStep(0);
  }

  function chooseOption(index: number) {
    setSelected(index);
    setShowError(false);

    if (question?.type === "choice" && !question.correct.includes(index)) {
      setWrongChoice(index);
      setWrongAttempt((current) => current + 1);
      navigator.vibrate?.(90);
      return;
    }

    setWrongChoice(null);
  }

  function goToNext() {
    setSelected(null);
    setTextAnswer("");
    setShowError(false);
    setWrongChoice(null);
    setStep((current) => current + 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question) return;

    if (question.type === "choice") {
      if (selected === null) {
        setShowError(true);
        return;
      }
      setAnswers((current) => ({ ...current, [question.id]: selected }));
    } else {
      if (!textAnswer.trim()) {
        setShowError(true);
        return;
      }
      setAnswers((current) => ({ ...current, [question.id]: textAnswer }));
    }

    goToNext();
  }

  function restart() {
    setStep(-1);
    setAnswers({});
    setSelected(null);
    setTextAnswer("");
    setShowError(false);
    setWrongChoice(null);
  }

  return (
    <main className={`quiz-shell ${isIntro ? "is-intro" : ""} ${isResult ? "is-result" : ""}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="paper-grain" />

      <section className="quiz-frame" aria-live="polite">
        <header className="topbar">
          <div className="brand-mark">
            <span className="brand-dot" />
            <span>8 месяцев (почти)</span>
          </div>

          {!isIntro && !isResult ? (
            <div className="step-count">
              <span>0{step + 1}</span>
              <i>/</i>
              <span>06</span>
            </div>
          ) : (
            <div className="tiny-heart" aria-hidden="true">♥</div>
          )}
        </header>

        <div className="progress-track" aria-hidden="true">
          <span style={{ width: isIntro ? "0%" : `${Math.min(((step + 1) / QUESTIONS.length) * 100, 100)}%` }} />
        </div>

        {isIntro && (
          <div className="screen intro-screen" key="intro">

            
            <button className="primary-button intro-button" onClick={startQuiz} type="button">
              <span>Начать викторину</span>
              <span className="button-arrow" aria-hidden="true">↗</span>
            </button>

            <div className="intro-footer">
              <span>01</span>
              <span className="footer-line" />
              <span>без подсказок</span>
            </div>
          </div>
        )}

        {question && (
          <div className="screen question-screen" key={question.id}>
            <div className="question-heading">
              <p className="eyebrow">Вопрос {question.id}</p>
              <Sparkle className="question-sparkle" />
              <h2>{question.question}</h2>
            </div>

            <form className="answer-form" onSubmit={handleSubmit}>
              {question.type === "choice" ? (
                <div className="options-list" role="radiogroup" aria-label="Варианты ответа">
                  {question.options.map((option, index) => (
                    <button
                      className={`option-button ${selected === index ? "is-selected" : ""} ${wrongChoice === index ? "is-wrong" : ""}`}
                      key={`${option}-${wrongChoice === index ? wrongAttempt : 0}`}
                      onClick={() => chooseOption(index)}
                      type="button"
                      role="radio"
                      aria-checked={selected === index}
                    >
                      <span className="option-index">0{index + 1}</span>
                      <span className="option-label">{option}</span>
                      <span className="option-check" aria-hidden="true">✓</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-answer-wrap">
                  <label className="text-label" htmlFor="answer">Твой ответ</label>
                  <input
                    autoComplete="off"
                    autoFocus
                    className="text-answer"
                    id="answer"
                    maxLength={40}
                    onChange={(event) => {
                      setTextAnswer(event.target.value);
                      setShowError(false);
                    }}
                    placeholder={question.placeholder}
                    type="text"
                    value={textAnswer}
                  />
                  <p className="answer-helper">{question.helper}</p>
                </div>
              )}

              {wrongChoice !== null && <p className="error-message wrong-answer-message" role="status">Неправильно!!</p>}
              {showError && <p className="error-message" role="alert">Выбери вариант, пожалуйста ♥</p>}

              <button className="primary-button next-button" type="submit">
                <span>{step === QUESTIONS.length - 1 ? "Узнать результат" : "Дальше"}</span>
                <span className="button-arrow" aria-hidden="true">↗</span>
              </button>
            </form>

            
          </div>
        )}

        {isResult && (
          <div className="screen result-screen" key="result">
            <div className="result-burst" aria-hidden="true">
              <Sparkle className="burst-sparkle burst-sparkle-one" />
              <Sparkle className="burst-sparkle burst-sparkle-two" />
              <Heart className="burst-heart" />
              <span className="burst-dot burst-dot-one" />
              <span className="burst-dot burst-dot-two" />
            </div>

            <p className="eyebrow result-kicker">ну всё, по фактам ↓</p>
            <h2>
              Твой результат:
              <strong>{percentage}%</strong>
              <span>правильных ответов</span>
            </h2>
            <p className="result-message">это было очень даже slay ✨</p>
            <p className="result-note">Последний ответ мы засчитали сердцем.<br />Ну а как иначе?</p>

            <button className="primary-button restart-button" onClick={restart} type="button">
              <span>Ещё разок ↗</span>
              <span className="button-arrow" aria-hidden="true">↗</span>
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
