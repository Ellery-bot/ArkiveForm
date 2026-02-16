"use client";

import ChatBot from "../components/ChatBot";

export default function FAQsPage() {
  const faqs = [
    {
      question: "Are you a legit seller / reseller?",
      answer: "Yes. I am a reseller sourcing from trusted suppliers. Transaction proofs and buyer feedback are available upon request."
    },
    {
      question: "Do you offer preorder or on-hand items?",
      answer: "Mostly preorder items. On-hand stocks will always be clearly stated in the post."
    },
    {
      question: "How does preorder work?",
      answer: "You secure a slot by submitting the order form and paying the required down payment. Orders are placed after confirmation."
    },
    {
      question: "What payment methods do you accept?",
      answer: "GCash, Maya and bank transfer. Other available methods will be indicated in the post."
    },
    {
      question: "Do you offer installment payments?",
      answer: "Yes, for selected items only. Installment terms will be clearly stated."
    },
    {
      question: "What if my item arrives damaged?",
      answer: "An unboxing video is required for any claims. Issues without an unboxing video cannot be accommodated."
    },
  ];

  return (
    <>
      <ChatBot faqs={faqs} />
    </>
  );
}
