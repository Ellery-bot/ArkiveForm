import Link from "next/link";

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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="card animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-t border-gray-300 pt-6 first:border-t-0 first:pt-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-800 leading-loose text-sm sm:text-base">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-4 flex-wrap border-t border-gray-300 pt-6">
            <Link href="/" className="btn-secondary inline-block text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
