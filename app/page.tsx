"use client";

import { useState, type CSSProperties } from "react";
import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const partyColors = ["#d77891", "#efb8bd", "#e6bd68", "#b4a4cf", "#91bdb0"];

export default function Home() {
  const [isOpening, setIsOpening] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);
  const [cakeStage, setCakeStage] = useState(0);

  function openLetter() {
    if (isOpening) return;

    if (cakeStage === 0) {
      setCakeStage(1);
      return;
    }

    setCakeStage(2);
    setIsOpening(true);

    window.setTimeout(() => {
      setShowWebsite(true);
      window.scrollTo({ top: 0 });
    }, 1550);
  }

  return (
  <>
    {isOpening && (
      <div className="celebration" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={`balloon-${index}`}
            className="party-balloon"
            style={{
              left: `${5 + index * 10}%`,
              "--party-color": partyColors[index % partyColors.length],
              "--drift": `${index % 2 === 0 ? -35 : 35}px`,
              animationDelay: `${(index % 4) * 0.16}s`,
            } as CSSProperties}
          />
        ))}
        {Array.from({ length: 60 }, (_, index) => (
          <span
            key={`confetti-${index}`}
            className="party-confetti"
            style={{
              left: `${(index * 37) % 100}%`,
              "--party-color": partyColors[index % partyColors.length],
              "--drift": `${((index * 29) % 180) - 90}px`,
              animationDelay: `${(index % 10) * 0.08}s`,
              animationDuration: `${2.4 + (index % 5) * 0.25}s`,
            } as CSSProperties}
          />
        ))}
      </div>
    )}
    {!showWebsite && (
      <section
        className={`opening-screen ${isOpening ? "is-opening" : ""} cake-stage-${cakeStage}`}
      >
        <button
          className="cake-button"
          onClick={openLetter}
          aria-label="Blow out the birthday candles and open the love letter"
        >
          <span className="envelope-kicker">Make a birthday wish</span>

          <span className="birthday-cake" aria-hidden="true">
            <span className="cake-candles">
              <span className="cake-candle"><i className="flame" /></span>
              <span className="cake-candle"><i className="flame" /></span>
              <span className="cake-candle"><i className="flame" /></span>
            </span>

            <span className="cake-body">
              <span className="cake-half cake-left" />
              <span className="cake-half cake-right" />
              <span className="cake-plate" />
            </span>
          </span>

          <span className="opening-hint">
            {cakeStage === 0
              ? "Tap the cake"
              : cakeStage === 1
                ? "One more"
                : "Opening your letter..."}
          </span>
        </button>
      </section>
    )}

    <main
      className={`website-content ${
        showWebsite ? "is-visible" : ""
      }`}
      aria-hidden={!showWebsite}
    >
      <section className="letter-section" id="letter">
        <article className={`letter ${dancingScript.className}`}>
          <p className="greeting">Dear Bum,</p>

          <h1>You are my favorite part of every day.</h1>

          <p>
            I know that we can only see each other through a screen but I will always
            include you in my daily life. I will always tell you about the little things that make me happy,
            and I will always ask you about the little things that make you happy.
          </p>

          <p>
            Life became warmer and more colorful when you entered it.
            You make me laugh when I need it most, and you make me feel calm whenever
            I feel overwhelmed.
          </p>

          <p>
            Thank you for being my safe place, my best friend and the person
            I always want to talk to. 
          </p>

          <p> 
            I am only one call away. I will always be here for you, no matter what.
          </p>

          <p className="signature">Hà ♥</p>
        </article>
      </section>

    </main>
  </>
);
}
