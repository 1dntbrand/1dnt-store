"use client";
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useFadeOnChange } from "../lib/fade-on-change";
import { Disclosure, DisclosureGroup } from "./disclosure";
import { faqTopics } from "../data/faq";
import { useStorefront } from "../storefront-context";
import { BrandText } from "./brand-text";
import { FidlockFaq } from "./fidlock-faq";

export function FaqSection() {
  const { t } = useStorefront((state) => ({ t: state.t }));
  const [active, setActive] = useState("care");
  const stackRef = useRef<HTMLDivElement>(null);
  useKeepPageStill(stackRef, active);
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
              onClick={() => {
                // Hold the current height before the new topic renders, so
                // the browser never sees a shorter page in between.
                const stack = stackRef.current;
                if (stack) stack.style.minHeight = `${stack.offsetHeight}px`;
                setActive(item.id);
              }}
            >
              <BrandText>{t(item.label)}</BrandText>
            </button>
          ))}
        </div>
        <div className="faq-stack" ref={stackRef}>
          {faqTopics.map((item) => (
            <FaqTopic key={item.id} id={item.id} active={item.id === active} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * A shorter topic takes only its own height, so no empty band is left under
 * it. The one case where that would move the page: the shopper is at the
 * very bottom, and the page getting shorter would pull everything down.
 * Then the block keeps its old height until the page has room to give it
 * back unseen, as soon as they scroll up.
 */
function useKeepPageStill(
  stackRef: RefObject<HTMLDivElement | null>,
  active: string,
) {
  useLayoutEffect(() => {
    const element = stackRef.current;
    if (!element) return;
    const extra = () =>
      element.offsetHeight -
      (element.querySelector<HTMLElement>("[data-active]")?.offsetHeight ?? 0);
    // How much further the page can scroll down.
    const room = () =>
      document.documentElement.scrollHeight -
      (window.scrollY + window.innerHeight);
    // Right after the tap the shorter topic can show at once, unless the
    // page is scrolled so far down that it would have to move.
    if (extra() <= 0 || room() >= extra()) {
      element.style.minHeight = "";
      return;
    }
    // Later, give the height back only while that part is below the screen.
    const release = () => {
      if (
        room() < extra() ||
        element.getBoundingClientRect().bottom < window.innerHeight
      )
        return;
      element.style.minHeight = "";
      window.removeEventListener("scroll", release);
    };
    window.addEventListener("scroll", release, { passive: true });
    return () => window.removeEventListener("scroll", release);
  }, [stackRef, active]);
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
