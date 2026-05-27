import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-6">
      {/* Main Content */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Card Container */}
        <div className="card card-padded home-card animate-fade-in flex flex-col max-h-[70vh]">

          {/* Scrollable content area on mobile */}
          <div className="overflow-y-auto flex-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

            {/* Image Section */}
            <div className="mt-2 mb-3 rounded-lg overflow-hidden h-56 flex items-center justify-center">
              {/* Logo text */}
              <div className="flex-shrink-0 flex items-center justify-end h-full">
                <div className="flex flex-col justify-center items-center text-center">
                  <span className="typing-logo-text">Arkive</span>
                  <span className="typing-subtitle">your trusted online shop</span>
                </div>
              </div>
              {/* Cat + cart image — fixed width */}
              <div className="relative h-full flex-shrink-0" style={{ width: '240px' }}>
                <Image
                  src="/arkive-cat.png"
                  alt="Arkive Market"
                  fill
                  className="object-contain object-left"
                  priority
                  quality={100}
                />
              </div>
            </div>

            {/* About Section */}
            <section id="about" className="mb-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <h2 className="text-base font-bold text-white mb-3 text-center">About Us</h2>
              <div className="text-gray-100 text-xs leading-snug flex flex-col gap-3">
                <p className="text-center">
                  <a
                    className="social-link text-blue-100"
                    href="/dti-certificate.pdf"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="View DTI Business Registration Certificate"
                  >
                    @DTI Registered Business
                  </a>
                </p>
                <p className="text-justify" lang="en">
                 Started in 2025, this independent reselling business began as a passion project and has grown into a small enterprise. Every order is personally handled with care, prioritizing honesty, clear communication, and reliability. I am committed to providing authentic products while building strong, trustworthy relationships with my customers. 
                </p>
              </div>
            </section>

          </div>

          {/* Navigation Buttons — always visible at bottom */}
          <section className="flex flex-wrap gap-2 justify-center pt-2 animate-fade-in shrink-0" style={{ animationDelay: "0.4s" }}>
            <Link 
              href="/terms"
              className="btn-blue nav-button text-xs"
            >
              T&C
            </Link>
            <Link 
              href="/faqs"
              className="btn-red nav-button text-xs"
            >
              FAQS
            </Link>
            <Link 
              href="/shop"
              className="btn-yellow nav-button text-xs"
            >
              SHOP
            </Link>
            <Link 
              href="/reviews"
              className="btn-green nav-button text-xs"
            >
              REVIEWS
            </Link>
          </section>

          {/* Footer Text */}
          {/* <p className="text-center text-xs text-blue-300 italic">
            Made with care by Arkive
          </p> */}
        </div>
      </main>
    </div>
  );
}
