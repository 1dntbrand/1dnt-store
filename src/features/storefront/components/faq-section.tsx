"use client";
import { useRef, useState } from "react";
import { useFadeOnChange } from "../lib/fade-on-change";
import { Disclosure, DisclosureGroup } from "./disclosure";
import { faqTopics } from "../data/faq";
import { useStorefront } from "../storefront-context";
import { BrandText } from "./brand-text";
import { FidlockFaq } from "./fidlock-faq";

export function FaqSection() {
  const { t } = useStorefront((state) => ({ t: state.t }));
  const [active, setActive] = useState("care");
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
        {/* All topics share one grid cell: the block keeps the height of the
            longest topic, so switching never moves what is below or above. */}
        <div className="faq-stack">
          {faqTopics.map((item) => (
            <FaqTopic key={item.id} id={item.id} active={item.id === active} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FaqTopic({ id, active }: { id: string; active: boolean }) {
  const t = useStorefront((state) => state.t);
  const list = useRef<HTMLDivElement>(null);
  useFadeOnChange(list, active, active);
  const topic = faqTopics.find((item) => item.id === id)!;
  return (
    <div
      ref={list}
      className="faq-questions"
      data-active={active || undefined}
      aria-hidden={!active}
      inert={!active}
    >
      {/* A topic that is put away starts closed next time: no hidden open
          answer keeps the block tall, and a playing video stops. */}
      <DisclosureGroup key={String(active)}>
        {id === "hardware" ? (
          <FidlockFaq />
        ) : (
          topic.questions.map((question) => (
            <Disclosure
              className="faq-question"
              key={question.question}
              summary={t(question.question)}
            >
              {question.answers.map((answer) => (
                <p key={answer}>{t(answer)}</p>
              ))}
            </Disclosure>
          ))
        )}
      </DisclosureGroup>
    </div>
  );
}
