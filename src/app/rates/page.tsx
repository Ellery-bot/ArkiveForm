import Link from "next/link";

export default function RatesPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="card animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Rates</h1>
          
          {/* Regular Local Events */}
          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Regular Local Events</h2>
            
            <div className="mb-6">
              <h3 className="font-bold text-sm sm:text-base mb-2">Mode of Payment</h3>
              <p className="italic text-sm mb-1">For PH-Based Clients</p>
              <p className="text-sm mb-2">Gcash, GoTyme, Maribank</p>
              <p className="italic text-sm mb-1">For International-Based Clients</p>
              <p className="text-sm">Sentbe, Wise (+₱50 transfer fee), and Paypal (+₱100 minimum transfer fee)</p>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-sm sm:text-base mb-3">Pre-Sale</h3>
              <ul className="text-sm space-y-1 ml-4">
                <li>• ₱1,000 — VVIP / SVIP / VIP Floor / MVP / Platinum</li>
                <li>• ₱900 — VIP Seated, Patron, and Lower Box (Bleachers Prem 1)</li>
                <li>• ₱700 — Bleachers Center and Mid 1</li>
                <li>• ₱600 — Upper Box (Bleachers Mid / Prem 2)</li>
                <li>• ₱500 — Gen-Ad (Bleachers Center 2)</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-sm sm:text-base mb-3">General Sale</h3>
              <ul className="text-sm space-y-1 ml-4">
                <li>• ₱1,100 — VVIP / SVIP / VIP Floor / MVP / Platinum</li>
                <li>• ₱1,000 — VIP Seated, Patron, and Lower Box (Bleachers Prem 1)</li>
                <li>• ₱800 — Bleachers Center and Mid 1</li>
                <li>• ₱700 — Upper Box (Bleachers Mid / Prem 2)</li>
                <li>• ₱600 — Gen-Ad (Bleachers Center 2)</li>
              </ul>
            </div>

            <div className="text-sm">
              <h3 className="font-bold mb-2">notes</h3>
              <p>the assistance fee is per ticket, and clients who opt for the pre-sale must have their own code.</p>
            </div>
          </section>

          <hr className="my-8" />

          {/* International Events */}
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">International Events</h2>
            
            <div className="mb-6">
              <h3 className="font-bold text-sm sm:text-base mb-2">Mode of Payment</h3>
              <p className="italic text-sm mb-1">For PH-Based Clients</p>
              <p className="text-sm mb-2">Gcash, GoTyme, Maribank</p>
              <p className="italic text-sm mb-1">For International-Based Clients</p>
              <p className="text-sm mb-4">Sentbe, Wise (+₱50 transfer fee), and Paypal (+₱100 minimum transfer fee)</p>
              
              <p className="text-sm">• ₱2,000 — All tiers and ticketing site</p>
            </div>

            <div className="text-sm">
              <h3 className="font-bold mb-2">notes</h3>
              <p>the assistance fee is per ticket, and clients who opt for the pre-sale must have their own code.</p>
            </div>
          </section>

          <div className="pt-6 flex justify-center gap-4 flex-wrap">
            <Link href="/" className="btn-secondary text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
