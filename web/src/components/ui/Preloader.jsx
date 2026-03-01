'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Preloader() {
  const pathname = usePathname();
  // Don't show preloader on event and billing detail pages
  const shouldSkipPreloader = pathname?.includes('/events/') || pathname?.includes('/billing/');
  
  const [phase, setPhase] = useState('draw');   // draw → logo → text → tagline → exit
  const [textState, setTextState] = useState('');
  const [mounted, setMounted] = useState(!shouldSkipPreloader);
  const fullText = 'BANQUETEASE';

  useEffect(() => {
    // Typewriter effect - starts at 3.2s, each char takes 80ms
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        setTextState(fullText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 80);

    // Delay typewriter to start after logo shows (3.2s)
    const typeStartDelay = setTimeout(() => {
      charIndex = 0;
      clearInterval(typeInterval);
      const newTypeInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          setTextState(fullText.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(newTypeInterval);
        }
      }, 80);
    }, 3200);

    const t1 = setTimeout(() => setPhase('logo'),   1800);  // SVG done drawing, show logo
    const t2 = setTimeout(() => setPhase('text'),   3000);  // Logo shown, start typing
    const t3 = setTimeout(() => setPhase('tagline'), 4200);  // Text done, show tagline
    const t4 = setTimeout(() => setPhase('exit'),   5000);  // Tagline shown, begin exit
    const t5 = setTimeout(() => setMounted(false),  5800);  // fully gone
    
    return () => {
      clearInterval(typeInterval);
      clearTimeout(typeStartDelay);
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        /* ── Preloader overlay ── */
        .pre-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #0d0505;
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
                      transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .pre-overlay.exit {
          opacity: 0;
          transform: scale(1.04);
          pointer-events: none;
        }

        /* ── Gold particle dots ── */
        .pre-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .pre-dot {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #C9921A;
          opacity: 0;
          animation: dotFade 4s ease-in-out infinite;
        }
        @keyframes dotFade {
          0%,100% { opacity: 0; transform: scale(0); }
          50%      { opacity: 0.6; transform: scale(1); }
        }

        /* ── SVG ornament container ── */
        .pre-stage {
          position: relative;
          width: min(500px, 90vw);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
        }

        /* ── Shared SVG/Logo container ── */
        .pre-center-container {
          position: relative;
          width: 320px;
          height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── SVG line art ── */
        .pre-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transition: opacity 0.9s ease;
        }
        .pre-svg.fade-out { opacity: 0; }

        /* Path draw animation */
        .pre-path {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: var(--dash-len, 1200);
          stroke-dashoffset: var(--dash-len, 1200);
          animation: drawPath var(--draw-dur, 2.2s) var(--draw-delay, 0s)
                     cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }

        /* ── Typewriter text container ── */
        .pre-text-wrap {
          position: relative;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
                      transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .pre-text-wrap.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .pre-typewriter {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #E8B84B;
          text-transform: uppercase;
          min-width: 200px;
          position: relative;
          display: inline-block;
        }

        /* Cursor blink during typing */
        .pre-typewriter::after {
          content: '';
          position: absolute;
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 1.1em;
          background: #E8B84B;
          animation: cursorBlink 0.7s step-end infinite;
        }
        .pre-typewriter.done::after {
          animation: none;
          content: '';
        }

        @keyframes cursorBlink {
          0%, 50%   { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* ── Logo PNG ── */
        .pre-logo-wrap {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.85);
          transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1),
                      transform 0.9s cubic-bezier(0.34,1.56,0.64,1);
        }
        .pre-logo-wrap.visible {
          opacity: 1;
          transform: scale(1);
        }
        .pre-logo-img {
          width: 240px;
          height: auto;
          filter: drop-shadow(0 0 32px rgba(201,146,26,0.55))
                  drop-shadow(0 0 8px rgba(201,146,26,0.3));
        }

        /* ── Bottom tagline ── */
        .pre-tagline {
          position: absolute;
          bottom: -56px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(0.75rem, 2.5vw, 0.875rem);
          letter-spacing: 0.32em;
          color: rgba(201,146,26,0.7);
          text-transform: uppercase;
          opacity: 0;
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s,
                      transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s;
          transform: translateX(-50%) translateY(6px);
        }
        .pre-tagline.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* ── Progress bar ── */
        .pre-bar-track {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          width: min(240px, 60vw);
          height: 1.5px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .pre-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #7B1C1C, #C9921A, #E8B84B);
          border-radius: 2px;
          animation: barFill 5.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes barFill {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      <div className={`pre-overlay${phase === 'exit' ? ' exit' : ''}`}>

        {/* Ambient gold particles */}
        <div className="pre-particles" aria-hidden="true">
          {[...Array(18)].map((_, i) => (
            <span
              key={i}
              className="pre-dot"
              style={{
                top: `${8 + (i * 31 * 1.618) % 84}%`,
                left: `${5 + (i * 47 * 1.618) % 90}%`,
                animationDelay: `${(i * 0.37) % 3.5}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            />
          ))}
        </div>

        {/* Centre stage */}
        <div className="pre-stage">

          {/* ── SVG & Logo shared container ── */}
          <div className="pre-center-container">
            {/* ── SVG ornament — draws itself ── */}
            <svg
              className={`pre-svg${phase === 'logo' || phase === 'text' || phase === 'tagline' || phase === 'exit' ? ' fade-out' : ''}`}
              viewBox="0 0 420 420"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
            {/* Outer circle */}
            <circle
              className="pre-path"
              cx="210" cy="210" r="190"
              stroke="#C9921A" strokeWidth="0.8" opacity="0.5"
              style={{ '--dash-len': '1194', '--draw-dur': '1.8s', '--draw-delay': '0s' }}
            />
            {/* Inner decorative circle */}
            <circle
              className="pre-path"
              cx="210" cy="210" r="158"
              stroke="#C9921A" strokeWidth="0.5" opacity="0.35"
              style={{ '--dash-len': '994', '--draw-dur': '1.6s', '--draw-delay': '0.15s' }}
            />
            {/* Innermost ring */}
            <circle
              className="pre-path"
              cx="210" cy="210" r="90"
              stroke="#E8B84B" strokeWidth="0.6" opacity="0.4"
              style={{ '--dash-len': '566', '--draw-dur': '1.4s', '--draw-delay': '0.3s' }}
            />

            {/* Cross lines */}
            <line className="pre-path" x1="210" y1="20"  x2="210" y2="400"
              stroke="#C9921A" strokeWidth="0.5" opacity="0.2"
              style={{ '--dash-len': '380', '--draw-dur': '1.4s', '--draw-delay': '0.2s' }} />
            <line className="pre-path" x1="20"  y1="210" x2="400" y2="210"
              stroke="#C9921A" strokeWidth="0.5" opacity="0.2"
              style={{ '--dash-len': '380', '--draw-dur': '1.4s', '--draw-delay': '0.3s' }} />
            {/* Diagonal lines */}
            <line className="pre-path" x1="76"  y1="76"  x2="344" y2="344"
              stroke="#C9921A" strokeWidth="0.5" opacity="0.15"
              style={{ '--dash-len': '380', '--draw-dur': '1.4s', '--draw-delay': '0.35s' }} />
            <line className="pre-path" x1="344" y1="76"  x2="76"  y2="344"
              stroke="#C9921A" strokeWidth="0.5" opacity="0.15"
              style={{ '--dash-len': '380', '--draw-dur': '1.4s', '--draw-delay': '0.4s' }} />

            {/* 8-point star / diamond motif */}
            <polygon
              className="pre-path"
              points="210,52 228,192 368,210 228,228 210,368 192,228 52,210 192,192"
              stroke="#C9921A" strokeWidth="1" opacity="0.55"
              style={{ '--dash-len': '1000', '--draw-dur': '1.8s', '--draw-delay': '0.5s' }}
            />

            {/* Inner decorative diamond */}
            <polygon
              className="pre-path"
              points="210,120 270,210 210,300 150,210"
              stroke="#E8B84B" strokeWidth="1.2" opacity="0.65"
              style={{ '--dash-len': '500', '--draw-dur': '1.4s', '--draw-delay': '0.7s' }}
            />

            {/* Ornamental petal arcs — top */}
            <path className="pre-path"
              d="M210,52 C260,100 260,160 210,120 C160,160 160,100 210,52"
              stroke="#C9921A" strokeWidth="0.9" opacity="0.5"
              style={{ '--dash-len': '300', '--draw-dur': '1.2s', '--draw-delay': '0.9s' }} />
            {/* right */}
            <path className="pre-path"
              d="M368,210 C320,260 260,260 300,210 C260,160 320,160 368,210"
              stroke="#C9921A" strokeWidth="0.9" opacity="0.5"
              style={{ '--dash-len': '300', '--draw-dur': '1.2s', '--draw-delay': '1.0s' }} />
            {/* bottom */}
            <path className="pre-path"
              d="M210,368 C160,320 160,260 210,300 C260,260 260,320 210,368"
              stroke="#C9921A" strokeWidth="0.9" opacity="0.5"
              style={{ '--dash-len': '300', '--draw-dur': '1.2s', '--draw-delay': '1.1s' }} />
            {/* left */}
            <path className="pre-path"
              d="M52,210 C100,160 160,160 120,210 C160,260 100,260 52,210"
              stroke="#C9921A" strokeWidth="0.9" opacity="0.5"
              style={{ '--dash-len': '300', '--draw-dur': '1.2s', '--draw-delay': '1.2s' }} />

            {/* Diagonal petal arcs */}
            <path className="pre-path"
              d="M76,76 C138,100 148,138 120,120 C100,148 100,106 76,76"
              stroke="#C9921A" strokeWidth="0.7" opacity="0.35"
              style={{ '--dash-len': '180', '--draw-dur': '1s', '--draw-delay': '1.3s' }} />
            <path className="pre-path"
              d="M344,76 C322,106 322,148 300,120 C272,138 282,100 344,76"
              stroke="#C9921A" strokeWidth="0.7" opacity="0.35"
              style={{ '--dash-len': '180', '--draw-dur': '1s', '--draw-delay': '1.4s' }} />
            <path className="pre-path"
              d="M344,344 C282,322 272,282 300,300 C322,272 322,312 344,344"
              stroke="#C9921A" strokeWidth="0.7" opacity="0.35"
              style={{ '--dash-len': '180', '--draw-dur': '1s', '--draw-delay': '1.5s' }} />
            <path className="pre-path"
              d="M76,344 C100,312 100,272 120,300 C148,282 138,322 76,344"
              stroke="#C9921A" strokeWidth="0.7" opacity="0.35"
              style={{ '--dash-len': '180', '--draw-dur': '1s', '--draw-delay': '1.6s' }} />

            {/* Tick marks around outer ring (12 positions) */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x1 = (210 + 185 * Math.cos(angle)).toFixed(6);
              const y1 = (210 + 185 * Math.sin(angle)).toFixed(6);
              const x2 = (210 + 196 * Math.cos(angle)).toFixed(6);
              const y2 = (210 + 196 * Math.sin(angle)).toFixed(6);
              return (
                <line key={i} className="pre-path"
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#E8B84B" strokeWidth="1.5" opacity="0.6"
                  style={{
                    '--dash-len': '14',
                    '--draw-dur': '0.5s',
                    '--draw-delay': `${1.7 + i * 0.05}s`,
                  }}
                />
              );
            })}

            {/* Centre cross / sunburst */}
            {[0, 45, 90, 135].map((deg, i) => {
              const r = (deg * Math.PI) / 180;
              const x1 = (210 + 36 * Math.cos(r)).toFixed(6);
              const y1 = (210 + 36 * Math.sin(r)).toFixed(6);
              const x2 = (210 - 36 * Math.cos(r)).toFixed(6);
              const y2 = (210 - 36 * Math.sin(r)).toFixed(6);
              return (
                <line key={deg} className="pre-path"
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#E8B84B" strokeWidth="1" opacity="0.7"
                  style={{
                    '--dash-len': '72',
                    '--draw-dur': '0.7s',
                    '--draw-delay': `${2.0 + i * 0.08}s`,
                  }}
                />
              );
            })}

            {/* Centre diamond */}
            <polygon
              className="pre-path"
              points="210,196 224,210 210,224 196,210"
              stroke="#E8B84B" strokeWidth="1.2" opacity="0.9"
              style={{ '--dash-len': '56', '--draw-dur': '0.5s', '--draw-delay': '2.3s' }}
            />
            </svg>

            {/* ── Logo appears in place of SVG ── */}
            <div className={`pre-logo-wrap${phase === 'logo' || phase === 'text' || phase === 'tagline' || phase === 'exit' ? ' visible' : ''}`}>
              <Image
                src="/BanquetEase.png"
                alt="BanquetEase"
                width={400}
                height={400}
                priority
                className="pre-logo-img"
              />
            </div>
          </div>

          {/* ── Typewriter text ── */}
          <div className={`pre-text-wrap${phase === 'text' ? ' visible' : ''}`}>
            <div className={`pre-typewriter${textState === fullText ? ' done' : ''}`}>
              {textState}
            </div>
          </div>

          {/* Tagline */}
          <span className={`pre-tagline${phase === 'tagline' ? ' visible' : ''}`} aria-hidden="true">
            Banquet Management
          </span>
        </div>

        {/* Progress bar */}
        {/* <div className="pre-bar-track" role="progressbar" aria-label="Loading">
          <div className="pre-bar-fill" />
        </div> */}
      </div>
    </>
  );
}
