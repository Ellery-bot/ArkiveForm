export default function CosmicDecorations() {
  // Generate random star positions
  const stars = [
    { id: 1, top: "10%", left: "15%", size: "large", delay: 0 },
    { id: 2, top: "30%", left: "5%", size: "small", delay: 0.2 },
    { id: 3, top: "50%", left: "85%", size: "small", delay: 0.4 },
    { id: 4, top: "70%", left: "10%", size: "medium", delay: 0.6 },
    { id: 5, top: "80%", left: "80%", size: "small", delay: 0.3 },
    { id: 6, top: "20%", left: "90%", size: "large", delay: 0.5 },
    { id: 7, top: "60%", left: "5%", size: "small", delay: 0.1 },
    { id: 8, top: "40%", left: "92%", size: "small", delay: 0.7 },
    { id: 9, top: "15%", left: "50%", size: "small", delay: 0.25 },
    { id: 10, top: "75%", left: "45%", size: "medium", delay: 0.45 },
  ];

  // Comets for moving animation
  const comets = [
    { id: 1, delay: 0 },
    { id: 2, delay: 2 },
    { id: 3, delay: 4 },
  ];

  const getSizeClass = (size: string) => {
    switch (size) {
      case "large":
        return "text-2xl";
      case "medium":
        return "text-lg";
      case "small":
        return "text-sm";
      default:
        return "text-base";
    }
  };

  return (
    <>
      {/* Floating Stars */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className={`absolute ${getSizeClass(star.size)} text-white opacity-70`}
          style={{
            top: star.top,
            left: star.left,
            animation: `twinkle 3s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            textShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
          }}
        >
          ✦
        </div>
      ))}

      {/* Moving Comets */}
      {comets.map((comet) => (
        <div
          key={`comet-${comet.id}`}
          className="absolute"
          style={{
            animation: `moveComet 4s linear infinite`,
            animationDelay: `${comet.delay}s`,
          }}
        >
          <div
            className="text-white text-xl"
            style={{
              textShadow: "0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(100, 150, 255, 0.6)",
            }}
          >
            ✨
          </div>
          {/* Comet tail */}
          <div
            className="absolute w-12 h-1"
            style={{
              background: "linear-gradient(to right, rgba(100, 150, 255, 0.6) 0%, transparent 100%)",
              top: "50%",
              left: "-50px",
              transform: "translateY(-50%)",
            }}
          />
        </div>
      ))}

      <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes moveComet {
          0% {
            top: -10%;
            left: -5%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 110%;
            left: 110%;
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
