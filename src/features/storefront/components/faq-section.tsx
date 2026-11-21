"use client";
import { useState } from "react";
import { faqTopics } from "../data/faq";
import { useStorefront } from "../storefront-context";
import { BrandText } from "./brand-text";
import { FidlockFaq } from "./fidlock-faq";

export function FaqSection() {
  const { t } = useStorefront((state) => ({ t: state.t }));
  const [active, setActive] = useState("care");
  const topic = faqTopics.find((item) => item.id === active)!;
  return (
    <div className="faq" id="faq">
      <h2>{t("faqEyebrow")}</h2>
      <div>
        <div className="faq-topics" role="group" aria-label={t("faqTopic")}>
          {faqTopics.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === active}
              onClick={() => setActive(item.id)}
            >
              <BrandText>{t(item.label)}</BrandText>
            </button>
          ))}
        </div>
        <div className="faq-questions" key={active}>
          {active === "hardware" ? (
            <FidlockFaq />
          ) : (
            topic.questions.map((question) => (
              <details className="faq-question" key={question.question}>
                <summary>{t(question.question)}</summary>
                {question.answers.map((answer) => (
                  <p key={answer}>{t(answer)}</p>
                ))}
              </details>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
