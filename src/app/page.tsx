import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Card Container */}
        <div className="card card-padded home-card animate-fade-in">
          {/* Image Section */}
          <div className="mt-4 mb-6 rounded-lg overflow-hidden h-48 sm:h-56 md:h-64 flex items-center justify-center relative">
            <Image 
              src="/arkive-logo.png" 
              alt="Arkive Market"
              fill
              className="object-contain"
              priority
              quality={100}
            />
          </div>


          {/* About Section */}
          <section id="about" className="mb-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 text-center">About Us</h2>
            <div className="text-gray-100 text-sm sm:text-base leading-loose flex flex-col gap-8">
              <p className="text-center">
                <a
                  className="social-link text-blue-100"
                  href="https://www.facebook.com/profile.php?id=61580470037051"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Arkive on Facebook"
                >
                  @arkivemarket
                </a>
              </p>
              <p className="text-left" lang="en">
               Started in 2025, this independent reselling business began as a passion project and has grown into a small enterprise. Every order is personally handled with care, prioritizing honesty, clear communication, and reliability. I am committed to providing authentic products while building strong, trustworthy relationships with my customers. 
              </p>
            </div>
          </section>

          {/* Navigation Buttons */}
          <section className="flex flex-nowrap gap-4 sm:gap-6 justify-center pt-12 overflow-x-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link 
              href="/terms"
              className="btn-blue nav-button text-sm sm:text-base"
            >
              T&C
            </Link>
            <Link 
              href="/faqs"
              className="btn-yellow nav-button text-sm sm:text-base"
            >
              FAQS
            </Link>
            <Link 
              href="/reviews"
              className="btn-green nav-button text-sm sm:text-base"
            >
              REVIEWS
            </Link>
            <Link 
              href="/form"
              className="btn-red nav-button text-sm sm:text-base"
            >
              FORM
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
