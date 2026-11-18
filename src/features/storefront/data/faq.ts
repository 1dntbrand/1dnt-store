export const faqTopics = [
  {
    id: "care",
    label: "faqCareCategory",
    questions: [
      { question: "faqCleanQuestion", answers: ["baseCare"] },
      { question: "faqMachineQuestion", answers: ["faqMachineAnswer"] },
    ],
  },
  {
    id: "sizes",
    label: "faqSizesTitle",
    questions: [
      {
        question: "faqMeasureQ",
        answers: [
          "faqMeasureIntro",
          "faqMeasureNeck",
          "faqMeasureChest",
          "faqMeasureEnd",
        ],
      },
      {
        question: "faqChooseSizeQ",
        answers: ["faqChooseSizeA", "faqChooseSizeEnd"],
      },
    ],
  },
  {
    id: "delivery",
    label: "faqDeliveryTitle",
    questions: [
      { question: "faqDeliveryCarriersQ", answers: ["faqDeliveryCarriersA"] },
      { question: "faqDeliveryTrackingQ", answers: ["faqDeliveryTrackingA"] },
      { question: "faqDeliveryCostQ", answers: ["faqDeliveryCostA"] },
      { question: "faqDeliveryTimeQ", answers: ["faqDeliveryTimeA"] },
    ],
  },
  {
    id: "payment",
    label: "faqPayTitle",
    questions: [{ question: "faqPayQ", answers: ["faqPayA"] }],
  },
  {
    id: "returns",
    label: "faqReturnTitle",
    questions: [
      { question: "faqChangeQ", answers: ["faqChangeA"] },
      { question: "faqFitReturnQ", answers: ["faqFitReturnA"] },
      { question: "faqReturnQ", answers: ["faqReturnA", "faqReturnNote"] },
    ],
  },
  { id: "hardware", label: "hardwareTitle", questions: [] },
];
