"use client";

import { useState, type CSSProperties } from "react";
import { Dancing_Script } from "next/font/google";
import Link from "next/link";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const partyColors = ["#d77891", "#efb8bd", "#e6bd68", "#b4a4cf", "#91bdb0"];

// Stable scatter values keep server and browser rendering in sync.
function heartScatter(index: number, channel: number) {
  let value = Math.imul(index + 1, 374761393) + Math.imul(channel + 1, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

function heartSpread(index: number, base: number) {
  let position = 0;
  let fraction = 1 / base;
  let remaining = index + 1;

  while (remaining > 0) {
    position += (remaining % base) * fraction;
    remaining = Math.floor(remaining / base);
    fraction /= base;
  }

  return position;
}

function FloatingHearts({ soft = false }: { soft?: boolean }) {
  const count = soft ? 72 : 300;
  const sideSize = Math.ceil(count / 2);

  return (
    <div className={`floating-hearts${soft ? " floating-hearts-soft" : ""}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const side = index % 2;
        const spreadIndex = Math.floor(index / 2) + side * sideSize;

        return (
          <span
            key={index}
            style={{
              left: soft
                ? `${index % 2 === 0 ? 1 + ((index * 7) % 17) : 81 + ((index * 7) % 17)}%`
                : `${(side === 0 ? 1 : 50) + heartSpread(spreadIndex, 2) * 49}%`,
              top: `${soft ? 3 + ((index * 29) % 92) : 2 + heartSpread(spreadIndex, 3) * 94}%`,
              fontSize: `${soft ? [12, 22, 46, 16, 76, 30, 18, 58, 24, 100, 36, 14][index % 12] : 12 + heartScatter(index, 2) * 42}px`,
              opacity: soft ? undefined : 0.12 + heartScatter(index, 3) * 0.2,
              animationDelay: `-${heartScatter(index, 4) * 20}s`,
              animationDuration: `${(soft ? 10 : 6) + heartScatter(index, 5) * 7}s`,
              "--heart-drift": `${heartScatter(index, 6) * 40 - 20}px`,
            } as CSSProperties}
          >
            {soft ? (
              <svg viewBox="0 0 40 40" focusable="false">
                <path d="M20 34S4 24 4 13C4 3 16 2 20 10C24 2 36 3 36 13C36 24 20 34 20 34Z" />
              </svg>
            ) : "♥"}
          </span>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [isOpening, setIsOpening] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);
  const [cakeStage, setCakeStage] = useState(0);
  const [balloonColors, setBalloonColors] = useState<string[]>([]);

  function openLetter() {
    if (isOpening) return;

    if (cakeStage === 0) {
      setCakeStage(1);
      return;
    }

    setBalloonColors(Array.from({ length: 48 }, () =>
      `hsl(${Math.floor(Math.random() * 360)} ${65 + Math.floor(Math.random() * 20)}% ${65 + Math.floor(Math.random() * 15)}%)`
    ));
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
        {balloonColors.map((color, index) => (
          <span
            key={`balloon-${index}`}
            className="party-balloon"
            style={{
              left: `${2 + ((index * 37) % 94)}%`,
              "--party-color": color,
              animationDelay: `${(index % 6) * 0.12}s`,
            } as CSSProperties}
          />
        ))}
        {Array.from({ length: 60 }, (_, index) => (
          <span
            key={`confetti-${index}`}
            className="party-confetti"
            style={{
              left: index % 2 === 0 ? "0%" : "100%",
              "--party-color": partyColors[index % partyColors.length],
              "--burst-x": `${(index % 2 === 0 ? 1 : -1) * (18 + ((index * 13) % 45))}vw`,
              "--burst-y": `-${35 + ((index * 17) % 40)}vh`,
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
        <FloatingHearts />
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
                ? "I LOVE YOU SO SO MUCH ♥"
                : "HAPPY BIRTHDAY ♥"}
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
        <FloatingHearts soft />
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
            tan, and just enjoy your birthday properly. ❤️
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
            I hope 23 is kind to you. I hope you get closer to everything you want. I 
            hope that you can relax and enjoy the little things in life, I hope you can
            be bring back the little child in you for the next year, learn to enjoy life
            the way it is, and you don&apos;t have to carry everything on your own.
          </p>

          <p>
            Even when I can&apos;t be there right now, just know that I&apos;m always praying 
            the best for you. I&apos;ll always be here cheering for you, listening to 
            you, supporting you, and loving you from wherever I am.❤️
          </p>

          <p>
            And no matter how old you think you are, you&apos;ll always be my 
            little princess.❤️
          </p>

          <p>
            Happy birthday, Bum. I love you and I miss you so so so much ❤️
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
