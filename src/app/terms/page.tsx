import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="card animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-6">Terms & Conditions</h1>
          
          <div className="space-y-5 text-gray-800 leading-relaxed text-sm sm:text-base">
            <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">1. Orders & Confirmation</h2>
              <p className="leading-normal">
                 All orders must be confirmed via the official order form or direct message. Orders are considered secured once payment (full or down payment, if applicable) is received.
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">2. Payment</h2>
              <p className="leading-normal">
                Accepted payment methods: GCash, bank transfer, and other methods specified per item. Payments must be made according to the schedule provided for each item.
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <h2 className="text-lg sm:text-xl font-bold text-blue-950 mb-2">3. Pricing & Availability</h2>
              <p className="leading-normal">
                Prices are subject to supplier costs and may change without prior notice. Availability is limited and items are sold on a first-come, first-served basis.
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <h2 className="text-lg sm:text-xl font-bold text-blue-950 mb-2">4. Preorders & Lead Time</h2>
              <p className="leading-normal">
                Preordered items will be delivered based on the estimated timelines shared. Delays may occur due to shipping, customs, or supplier issues, which are beyond our control.
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <h2 className="text-lg sm:text-xl font-bold text-blue-950 mb-2">5. Shipping & Handling</h2>
              <p className="leading-normal">
                Items are securely packed to minimize risk of damage during transit. Buyers are responsible for shipping fees unless stated otherwise. Tracking numbers will be provided once items are shipped.
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <h2 className="text-lg sm:text-xl font-bold text-blue-950 mb-2">6. Damaged or Defective Items</h2>
              <p className="leading-normal">
                 Buyers must record an unboxing video upon receiving the item. Claims for damaged or defective items will only be accepted with an unboxing video.
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
              <h2 className="text-lg sm:text-xl font-bold text-blue-950 mb-2">7. Refunds & Cancellations</h2>
              <p className="leading-normal">
                 Down payments or full payments are non-refundable once the order is confirmed. Cancellations are not allowed unless the item is unavailable from the supplier.
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
              <h2 className="text-lg sm:text-xl font-bold text-blue-950 mb-2">8. Authenticity</h2>
              <p className="leading-normal">
                All items sold are guaranteed authentic and sourced from trusted suppliers. No replicas or unofficial items are sold.
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
              <h2 className="text-lg sm:text-xl font-bold text-blue-950 mb-2">9. Buyer Responsibilities</h2>
              <p className="leading-normal">
                 Ensure correct details (name, address, contact info) are provided for shipping. Communicate promptly for any concerns or clarifications.
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
              <h2 className="text-lg sm:text-xl font-bold text-blue-950 mb-2">10. Limitation of Liability</h2>
              <p className="leading-normal">
                The reseller is not liable for delays, lost packages after shipping, or damages caused by third-party couriers. Responsibility ends once the item is handed over to the courier with proper packaging.
              </p>
            </section>

            <section className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
              <h2 className="text-lg sm:text-xl font-bold text-blue-950 mb-2">11. Amendments</h2>
              <p className="leading-normal">
                Terms and conditions may be updated or changed at any time. Buyers will be notified of major changes.
              </p>
            </section>
          </div>

          <div className="mt-6 pt-4 flex justify-center">
            <Link href="/" className="btn-secondary inline-block text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
