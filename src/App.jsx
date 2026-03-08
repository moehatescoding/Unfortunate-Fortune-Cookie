import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// ─── Fortune pool ─────────────────────────────────────────────────────────────
const FORTUNES = [
  // ── Deadpan two-liners ──
  "Your big break is coming. It's just someone else's turn first.",
  "Love is blind. And apparently deaf to your messages too.",
  "Tomorrow brings new opportunities. None of them for you.",
  "You're one in a million. Unfortunately, the million is ahead of you.",
  "Your hard work will pay off. In compliments nobody asked for.",
  "The light at the end of the tunnel? It's just your phone screen dying.",
  "Dreams do come true. Yours involve missing deadlines.",
  "Good things come to those who wait. You've been waiting since 2019.",
  "Confidence is key. Too bad yours unlocks nothing.",
  "You'll find inner peace. Right after the anxiety finishes its coffee.",
  "Karma is real. And it has your ex's number saved.",
  "The universe has a plan for you. It's called \"character development.\"",
  "Your vibe attracts your tribe. Yours is mostly mosquitoes.",
  "Everything happens for a reason. Usually to humble you specifically.",
  "You're not lazy. You're on energy-saving mode… permanently.",
  "Success is just around the corner. The corner keeps moving.",
  "People say you're one of a kind. They mean irreplaceable… in the friend zone.",
  "Your time will come. After everyone else's has already left.",
  "You bring joy wherever you go. Mostly when you leave.",
  "The early bird gets the worm. You're the bird that sleeps through sunrise.",
  "Money can't buy happiness. But it can buy Wi-Fi, which you still don't have.",
  "You're destined for greatness. Greatness just hasn't checked its spam folder.",
  "Life is short. Your to-do list isn't.",
  "Keep your head up. The ceiling fan is spinning.",
  "You're stronger than you think. Your Wi-Fi password disagrees.",
  "Tomorrow is a new day. With the same old problems.",
  "You matter. Just not to HR right now.",
  "Believe in yourself. Everyone else already gave up.",
  "Good vibes only. Yours expired in 2023.",
  "This too shall pass. Very slowly, and with extra bills.",

  // ── Savage one-liners ──
  "Your soulmate is already married... to your boss.",
  "The promotion goes to your coworker who arrives late every day.",
  "You will trip in front of your crush... and flash your underwear.",
  "Your diet fails spectacularly on the first cheat day.",
  "A bird poops on you right before your big interview.",
  "Your ex finds true love... immediately after blocking you.",
  "That lottery ticket? One number off. Forever.",
  "Your phone dies mid-confession of love.",
  "Gray hairs multiply overnight. Welcome to old age.",
  "You'll live long enough to watch all your savings vanish.",
  "Your \"lucky\" meal gives you food poisoning for a week.",
  "A spider nests in your favorite shoes tonight.",
  "Car breaks down in pouring rain, no signal.",
  "You sneeze loudly during the quietest meeting ever.",
  "Best friend borrows money... and ghosts.",
  "The IRS notices you tomorrow. Good luck.",
  "Your shirt shrinks in the wash. All of them.",
  "Love of your life friendzones you eternally.",
  "$20 mysteriously vanishes from your wallet daily.",
  "You'll say the wrong name... in bed.",
  "Socks lose their pairs. Every load.",
  "What you just ate? Definitely not chicken.",
  "Wet spot on the floor — right after fresh socks.",
  "Your dog loves the neighbor more.",
  "Elevator stops between floors. With your phobia.",
  "Coffee spills on your white shirt. Every morning.",
  "Dream job interview? You blank on your name.",
  "Family reunion: Everyone but you wins big.",
  "WiFi cuts out during your viral moment.",
  "The one who got away? Now a billionaire.",
  "Toilet overflows on your only clean pants.",
  "Your shadow whispers secrets... no one believes.",
  "Alarm fails. Boss notices. You're fired.",
  "Mirror cracks. Seven years of bad selfies.",
  "Pizza delivery: Cold, wrong toppings, extra charge.",
  "Childhood bully? Now your new boss.",
  "Rain on your wedding day... indoors.",
  "Pet betrays you for treats from strangers.",
  "Bank app glitches: Overdraft city.",
  "\"Free sample\" gives you hives for days.",
  "Flight delayed 12 hours. No refunds.",
  "Your clone succeeds where you fail.",
  "Umbrella inside-out in hurricane winds.",
  "Date stands you up... with your credit card.",
  "Power outage mid-Netflix binge finale.",
  "\"One more level\" costs you sleep for a week.",
  "Mirror lies: You're aging backwards? Nope.",
  "Lucky charm? Cursed. Burn it.",
  "Tomorrow's plan: Total chaos.",
  "This fortune is the highlight of your week.",
];

const randomFortune = () => FORTUNES[Math.floor(Math.random() * FORTUNES.length)];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // phase: idle → cracking → revealed
  const [phase, setPhase] = useState('idle');
  const [fortune, setFortune] = useState('');
  const [cookieSrc, setCookieSrc] = useState(null);
  const audioRef = useRef(null);
  const cookieControls = useAnimation();

  // Remove white background from cookie image using canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;

      // Strip near-white pixels with smooth feathering
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const brightness = (r + g + b) / 3;
        // Also check if the pixel is "grayish white" (low saturation)
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const saturation = maxC > 0 ? (maxC - minC) / maxC : 0;

        if (brightness > 230 && saturation < 0.1) {
          // Fully transparent for near-white, low-saturation pixels
          d[i + 3] = 0;
        } else if (brightness > 195 && saturation < 0.15) {
          // Smooth feather edge
          const alpha = Math.round(((230 - brightness) / 35) * 255);
          d[i + 3] = Math.min(d[i + 3], Math.max(0, alpha));
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setCookieSrc(canvas.toDataURL('image/png'));
    };
    img.src = '/cookie.png';
  }, []);

  useEffect(() => {
    audioRef.current = new Audio('/crack.mp3');
    audioRef.current.volume = 0.45;
  }, []);

  const handleCrack = useCallback(async () => {
    if (phase !== 'idle') return;
    setPhase('cracking');

    // Play crack sound
    try { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => { }); } catch (_) { }

    // Shake animation
    await cookieControls.start({
      x: [0, -14, 14, -10, 10, -6, 6, 0],
      rotate: [0, -3, 3, -2, 2, -1, 1, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    });

    // Crack — scale down and fade
    await cookieControls.start({
      scale: 0,
      opacity: 0,
      y: -30,
      transition: { duration: 0.35, ease: 'easeIn' },
    });

    setFortune(randomFortune());
    setPhase('revealed');
  }, [phase, cookieControls]);

  const reset = useCallback(async () => {
    setPhase('idle');
    setFortune('');
    cookieControls.set({ scale: 0, opacity: 0, y: 20 });
    await cookieControls.start({
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    });
  }, [cookieControls]);

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        background: 'radial-gradient(ellipse at 50% 40%, #fdf8f0 0%, #ece8e0 100%)',
        minHeight: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

      {/* Decorative ambient glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 55%, rgba(215,170,90,0.13) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* ── Title ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 'clamp(28px, 5vh, 48px)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <p style={{
          letterSpacing: '0.42em',
          fontSize: 'clamp(0.6rem, 1.8vw, 0.85rem)',
          color: '#8b5e1a',
          textTransform: 'uppercase',
          fontStyle: 'italic',
          margin: 0,
        }}>
          Unfortunate Fortune Cookie
        </p>
      </motion.header>

      {/* ── Cookie image + float idle animation ── */}
      <AnimatePresence>
        {phase !== 'revealed' && (
          <motion.div
            key="cookie-container"
            style={{
              position: 'relative',
              zIndex: 5,
              cursor: phase === 'idle' ? 'pointer' : 'default',
            }}
            onClick={handleCrack}
            animate={cookieControls}
            initial={{ scale: 1, opacity: 1, y: 0 }}
          >
            {/* Soft ground shadow */}
            <div style={{
              position: 'absolute',
              bottom: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '65%',
              height: 22,
              background: 'radial-gradient(ellipse, rgba(100,60,10,0.22) 0%, transparent 75%)',
              borderRadius: '50%',
              filter: 'blur(6px)',
            }} />

            {/* Cookie with idle float */}
            <motion.div
              animate={phase === 'idle' ? {
                y: [0, -14, 0],
                rotate: [0, 1.2, -0.8, 0],
              } : {}}
              transition={phase === 'idle' ? {
                y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
              } : {}}
            >
              {cookieSrc ? (
                <img
                  src={cookieSrc}
                  alt="Fortune Cookie"
                  draggable={false}
                  style={{
                    width: 'clamp(200px, 38vw, 360px)',
                    height: 'auto',
                    display: 'block',
                    filter: 'drop-shadow(0 20px 34px rgba(100,60,10,0.38)) drop-shadow(0 5px 10px rgba(100,60,10,0.2))',
                  }}
                />
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Idle hint ── */}
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              marginTop: 'clamp(20px, 4vh, 36px)',
              letterSpacing: '0.44em',
              fontSize: 'clamp(0.6rem, 1.6vw, 0.8rem)',
              color: '#9b6a1e',
              textTransform: 'uppercase',
              zIndex: 10,
            }}
          >
            Click to crack
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Cracking loader dots ── */}
      <AnimatePresence>
        {phase === 'cracking' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: 14, marginTop: 20, zIndex: 10 }}
          >
            {[0, 0.18, 0.36].map((delay, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.85, repeat: Infinity, delay, ease: 'easeInOut' }}
                style={{ width: 10, height: 10, borderRadius: '50%', background: '#a06820' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fortune paper slip ── */}
      <AnimatePresence>
        {phase === 'revealed' && (
          <motion.div
            key="paper"
            initial={{ y: 60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
          >
            {/* Paper card */}
            <div
              onClick={reset}
              style={{
                background: '#fdfbf4',
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.55rem, #ddd6c4 1.55rem, #ddd6c4 1.63rem)',
                boxShadow: '0 20px 60px -10px rgba(100,55,10,0.28), 0 6px 16px -4px rgba(100,55,10,0.14)',
                borderRadius: 4,
                padding: 'clamp(1.6rem, 4vw, 2.4rem) clamp(2rem, 5vw, 3rem)',
                width: 'min(88vw, 440px)',
                minHeight: 140,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                position: 'relative',
                // Subtle paper curl top-left
                borderTop: '1px solid rgba(180,160,120,0.3)',
              }}
            >
              {/* Paper ribbon top */}
              <div style={{
                position: 'absolute',
                top: -1, left: '15%', right: '15%',
                height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(190,160,110,0.5), transparent)',
              }} />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                style={{
                  color: '#2a1a06',
                  fontStyle: 'italic',
                  fontSize: 'clamp(1rem, 3.2vw, 1.3rem)',
                  lineHeight: 1.7,
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                {fortune}
              </motion.p>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                style={{
                  fontSize: '0.65rem',
                  letterSpacing: '0.38em',
                  textTransform: 'uppercase',
                  color: '#a07830',
                  fontStyle: 'normal',
                }}
              >
                tap to try again
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <footer style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 'clamp(16px, 3vh, 28px)',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <p style={{
          fontSize: '0.58rem',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.18)',
          fontFamily: 'sans-serif',
          margin: 0,
        }}>
          Developed by Moegical
        </p>
      </footer>
    </div>
  );
}
