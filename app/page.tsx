"use client";

import { useState, type CSSProperties } from "react";
import { Dancing_Script } from "next/font/google";
import Link from "next/link";

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
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 2800);
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
          disabled={isOpening}
          aria-label="Blow out the birthday candles and open the love letter"
        >
          <span className="envelope-kicker">Make a wish</span>

          <span className="birthday-cake" aria-hidden="true">
            <span className="cake-candles">
              <span className="cake-candle">
                <svg className="number-candle" viewBox="0 0 52 72">
                  <path d="M8 17C8 1 44 1 44 18C44 32 8 37 8 62H44" />
                </svg>
                <i className="flame" />
              </span>
              <span className="cake-candle">
                <svg className="number-candle" viewBox="0 0 52 72">
                  <path d="M8 13C20 1 44 5 44 20C44 30 35 34 25 34C36 34 44 39 44 49C44 66 20 70 8 58" />
                </svg>
                <i className="flame" />
              </span>
            </span>

            <span className="cake-body">
              <span className="cake-edible">
                <span className="cake-half cake-left" />
                <span className="cake-half cake-right" />
              </span>
              <span className="cake-plate" />
            </span>
          </span>

          <span className="opening-hint">
            {cakeStage === 0
              ? "Blow the candles"
              : cakeStage === 1
                ? "Eat the cake"
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
          <p className="greeting">Dear Bum iu ♥</p>

          <h1>Happy 23rd Birthday!</h1>

          <p>
            I wish nothing but the best for you,
          </p>

          <p>
            I know this week you have a lot of work and school stuff to deal 
            with, but just for today, how about taking a little break 
            and spoiling yourself a bit? Just relax and don&apos;t 
            care about anything for one day. Go to the beach, get even more 
            tan, and just enjoy your birthday properly =))))
          </p>

          <p> 
            I really wish I could be there with you today, it makes me a 
            little sad that I can&apos;t be there for your birthday this year. 
            But then I remind myself that I only have to be away from 
            you for two birthdays. So… one down, only one more to go.
          </p>

          <p>
            I know right now we can only see each other through a screen, 
            but I never want the distance to make you feel like I&apos;m not 
            part of your life. I still want to know everything. The random 
            things that happened during your day, what you ate, what made 
            you laugh, what stressed you out, what made you tired, what made 
            you proud of yourself. Even the smallest things matter to me because 
            they&apos;re part of your life, and I want to be part of all of it.
          </p>

          <p>
            I&apos;m so proud of you too. Not just because of what you achieve, 
            but because I see how hard you try. I see how tired you get, 
            how much pressure you put on yourself, and how you still keep 
            going. Sometimes I really wish I could teleport to you, hold you, 
            and let you rest for a while.
          </p>

          <p>
            I know things between us won&apos;t always be easy. There will be 
            distance, stress, stupid arguments, bad days, and times when 
            both of us are exhausted. But I want to grow with you. I want to 
            figure things out with you. I want to make mistakes, fix them, 
            learn each other better, and keep building us.
          </p>

          <p>
            Whenever you&apos;re tired, overwhelmed, lonely, happy, excited, call me. ❤️ 
            I can&apos;t promise I&apos;ll always know how to fix everything, but I can 
            promise you won&apos;t have to sit with it alone.
          </p>

          <p>
            I hope 23 is kind to you. I hope you get closer to everything you want. 
            I hope you have moments that make you feel proud of yourself, moments 
            that make you laugh, and moments where you stop and realize how loved 
            you really are.
          </p>

          <p>
            Even when I can&apos;t be there physically, just know that I&apos;m always praying 
            for the best for you. I&apos;ll always be here cheering for you, listening to 
            you, supporting you, and loving you from wherever I am.❤️
          </p>

          <p>
            And no matter how old you think you are, you&apos;ll always be my 
            little princess.❤️
          </p>

          <p>
            Happy birthday, Bum. I love you so, so much.❤️
          </p>

          <p> 
            p.s. Your present might arrive a little later than expected… I&apos;m sorry =)))) 
            And since I couldn&apos;t give you a handwritten letter this year, I guess this 
            will do for now. You&apos;ll get the handwritten one when you come back. ❤️
          </p>

          <p className="signature">Bồ iu ♥</p>
          <div className="letter-next">
            <Link className="main-button" href="/photos">Our little photo album →</Link>
          </div>
        </article>
      </section>

    </main>
  </>
);
}
