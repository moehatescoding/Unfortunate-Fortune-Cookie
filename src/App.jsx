import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FALLBACK_FORTUNES = [
  "You will soon receive good news. It might be meant for someone else.",
  "Today is a great day to start something new. Tomorrow works too.",
  "Someone will appreciate your honesty. Eventually.",
  "Your hard work will soon be noticed. By the wrong person.",
  "A brilliant idea will come to you. Probably in the shower.",
  "Your phone battery will last longer today. Unlikely, but hopeful.",
  "You will soon remember something important. Three hours too late.",
  "Someone will ask for your advice. They won’t follow it.",
  "A small problem will solve itself. Mostly because you ignored it.",
  "Today is a good day to clean your room. Or at least think about it.",
  "You will soon check your phone again. Yes, right now.",
  "Someone will laugh at your joke. Out of politeness.",
  "Your cooking will impress someone. Lower expectations first.",
  "You will soon find what you were looking for. In the last place you check.",
  "A calm and peaceful moment is coming. Enjoy it quickly.",
  "You will soon learn a valuable lesson. The hard way.",
  "Someone will return something you lost. Hopefully.",
  "Your alarm clock will test your character tomorrow morning.",
  "A friend will need your help. With moving furniture.",
  "Your confidence will grow today. Your skills are still loading.",
  "You will soon discover why they invented the snooze button.",
  "A message will arrive soon. It will say “Hi.”",
  "Your internet will work perfectly today. For five minutes.",
  "Someone will remember you today. When they need something.",
  "You will finally organize your life. Starting with one drawer.",
  "You will soon solve a problem. It will create two new ones.",
  "Today is a good day to try something new. Panic is optional.",
  "Someone will remember your name today. After asking twice.",
  "Your future looks promising. Details are unclear.",
  "A good habit will begin today. It will end tomorrow.",
  "You will soon hear good news. It will be about someone else.",
  "Your phone will ring soon. It’s probably spam.",
  "A calm moment is coming. Don’t ruin it.",
  "You will finally understand something important. Briefly.",
  "Today is a good day to stay positive. Try again later.",
  "Someone will laugh at your joke. Mostly out of kindness.",
  "Your plans will go smoothly. After several adjustments.",
  "You will soon remember why you walked into the room. Maybe.",
  "A message you are waiting for will arrive. Manage expectations.",
  "Someone will give you useful advice. You will ignore it.",
  "Your memory will improve today. You forgot why.",
  "A new opportunity will appear. Please notice it.",
  "Your day will improve soon. Slightly.",
  "Someone will agree with you today. By accident.",
  "You will find something you lost. It was under you.",
  "Someone will need your help today. With heavy furniture.",
  "Your schedule will finally make sense. On paper.",
  "A great idea will visit your mind. It will not stay long.",
  "You will soon receive a compliment. It will confuse you.",
  "Today is a good day to take a break. From planning to take a break.",
  "Someone will ask how you are doing. Think carefully.",
  "Your luck will improve today. Marginally.",
  "You will soon realize the obvious. Everyone else did earlier.",
  "You will be happy, for five minutes.",
  "Everything will work out, briefly.",
  "Your luck will improve, slightly.",
  "Today will be productive, for a moment.",
  "You will feel motivated, until lunch.",
  "Your life will make sense, temporarily.",
  "A great idea will come to you, then disappear.",
  "You will feel confident, right before the mistake.",
  "Your plans will succeed, in theory.",
  "Today will be peaceful, until you check your phone.",
  "You will remember something important, too late.",
  "Your future looks bright, lower the brightness.",
  "You will find the answer, then doubt it.",
  "Your discipline will return, briefly.",
  "Everything will be clear, for a second.",
  "Someone will praise you, sarcastically.",
  "You will understand everything, then forget it.",
  "Your patience will pay off, eventually maybe.",
  "Today will be calm, unless you open your email.",
  "You will make a wise decision, surprisingly."
]

// Premium SVG Fortune Cookie with 3D shading
const CookieSVG = () => (
  <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
    <defs>
      {/* Main gradient — golden brown 3D look */}
      <radialGradient id="cookieBody" cx="45%" cy="38%" r="58%" fx="35%" fy="30%">
        <stop offset="0%" stopColor="#F5C842" />
        <stop offset="30%" stopColor="#E8A830" />
        <stop offset="65%" stopColor="#C9873A" />
        <stop offset="100%" stopColor="#8B5E1A" />
      </radialGradient>
      {/* Edge darkening */}
      <radialGradient id="cookieEdge" cx="50%" cy="50%" r="50%">
        <stop offset="60%" stopColor="transparent" />
        <stop offset="100%" stopColor="#5C3000" stopOpacity="0.5" />
      </radialGradient>
      {/* Inner highlight */}
      <radialGradient id="cookieHighlight" cx="35%" cy="30%" r="40%">
        <stop offset="0%" stopColor="#FFF5C0" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#FFF5C0" stopOpacity="0" />
      </radialGradient>
      {/* Drop shadow filter */}
      <filter id="cookieShadow" x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#000" floodOpacity="0.5" />
      </filter>
      {/* Subtle inner glow */}
      <filter id="innerGlow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Drop shadow layer */}
    <ellipse cx="120" cy="192" rx="70" ry="10" fill="#000" opacity="0.3" />

    {/* Cookie body — classic folded shape */}
    <g filter="url(#cookieShadow)">
      {/* Left wing */}
      <path
        d="M 120 55
           C 60 52, 28 78, 32 118
           C 35 148, 62 168, 90 170
           C 105 172, 115 165, 120 155"
        fill="url(#cookieBody)"
      />
      {/* Right wing */}
      <path
        d="M 120 55
           C 180 52, 212 78, 208 118
           C 205 148, 178 168, 150 170
           C 135 172, 125 165, 120 155"
        fill="url(#cookieBody)"
      />
      {/* Center fold / pinch */}
      <path
        d="M 120 55 C 110 90, 108 115, 120 155
           C 132 115, 130 90, 120 55"
        fill="#A06828"
        opacity="0.7"
      />
    </g>

    {/* Highlight overlay */}
    <path
      d="M 120 55
         C 60 52, 28 78, 32 118
         C 35 148, 62 168, 90 170
         C 105 172, 115 165, 120 155
         C 132 115, 130 90, 120 55"
      fill="url(#cookieHighlight)"
    />
    <path
      d="M 120 55
         C 180 52, 212 78, 208 118
         C 205 148, 178 168, 150 170
         C 135 172, 125 165, 120 155
         C 132 115, 130 90, 120 55"
      fill="url(#cookieHighlight)"
    />

    {/* Edge darkening */}
    <path
      d="M 120 55
         C 60 52, 28 78, 32 118
         C 35 148, 62 168, 90 170
         C 105 172, 115 165, 120 155
         C 125 165, 135 172, 150 170
         C 178 168, 205 148, 208 118
         C 212 78, 180 52, 120 55 Z"
      fill="url(#cookieEdge)"
    />

    {/* Fold crease lines */}
    <path d="M 120 55 C 114 90, 112 120, 120 155"
      stroke="#7A4E10" strokeWidth="1.5" fill="none" opacity="0.8" strokeLinecap="round" />
    <path d="M 120 55 C 126 90, 128 120, 120 155"
      stroke="#C8902A" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round" />

    {/* Left wing inner crease */}
    <path d="M 100 60 C 75 75, 62 110, 75 148"
      stroke="#8B6020" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round" />

    {/* Right wing inner crease */}
    <path d="M 140 60 C 165 75, 178 110, 165 148"
      stroke="#8B6020" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round" />

    {/* Paper slip peeking */}
    <rect x="112" y="72" width="16" height="22" rx="1"
      fill="#F5F0E8" opacity="0.85"
      stroke="#DDD5C0" strokeWidth="0.5" />
    <line x1="115" y1="78" x2="125" y2="78" stroke="#C8B88A" strokeWidth="0.8" opacity="0.6" />
    <line x1="115" y1="83" x2="125" y2="83" stroke="#C8B88A" strokeWidth="0.8" opacity="0.6" />
    <line x1="115" y1="88" x2="125" y2="88" stroke="#C8B88A" strokeWidth="0.8" opacity="0.6" />
  </svg>
)

// Left half only (for break animation)
const CookieLeftSVG = () => (
  <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
    <defs>
      <radialGradient id="cbL" cx="40%" cy="38%" r="65%" fx="30%" fy="28%">
        <stop offset="0%" stopColor="#F5C842" />
        <stop offset="35%" stopColor="#E8A830" />
        <stop offset="70%" stopColor="#C9873A" />
        <stop offset="100%" stopColor="#8B5E1A" />
      </radialGradient>
      <filter id="shadowL" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="-4" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.4" />
      </filter>
    </defs>
    <g filter="url(#shadowL)">
      <path
        d="M 120 55
           C 60 52, 28 78, 32 118
           C 35 148, 62 168, 90 170
           C 105 172, 115 165, 120 155
           C 114 120, 112 90, 120 55"
        fill="url(#cbL)"
      />
    </g>
    <path d="M 120 55 C 114 90, 112 120, 120 155"
      stroke="#7A4E10" strokeWidth="1.5" fill="none" opacity="0.8" strokeLinecap="round" />
  </svg>
)

// Right half only
const CookieRightSVG = () => (
  <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
    <defs>
      <radialGradient id="cbR" cx="60%" cy="38%" r="65%" fx="70%" fy="28%">
        <stop offset="0%" stopColor="#F5C842" />
        <stop offset="35%" stopColor="#E8A830" />
        <stop offset="70%" stopColor="#C9873A" />
        <stop offset="100%" stopColor="#8B5E1A" />
      </radialGradient>
      <filter id="shadowR" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="4" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.4" />
      </filter>
    </defs>
    <g filter="url(#shadowR)">
      <path
        d="M 120 55
           C 180 52, 212 78, 208 118
           C 205 148, 178 168, 150 170
           C 135 172, 125 165, 120 155
           C 128 120, 130 90, 120 55"
        fill="url(#cbR)"
      />
    </g>
    <path d="M 120 55 C 126 90, 128 120, 120 155"
      stroke="#C8902A" strokeWidth="1" fill="none" opacity="0.8" strokeLinecap="round" />
  </svg>
)

export default function App() {
  const [status, setStatus] = useState('idle')
  const [fortune, setFortune] = useState('')
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio('/crack.mp3')
    audioRef.current.volume = 0.5
  }, [])

  const fetchFortune = useCallback(async () => {
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
      if (!apiKey) throw new Error("No API Key")
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 100,
          system: "You are a fortune cookie that gives hilariously terrible, unhinged, brutally honest life advice. Keep it to ONE sentence max. Be deadpan. No emojis. No hashtags. Make it absurd but not try-hard. Examples: \"Someone is thinking about you right now. They are mildly annoyed.\" / \"Your lucky numbers are: none. Try letters.\" / \"A surprise is coming. It is a bill.\" Only return the fortune. Nothing else.",
          messages: [{ role: 'user', content: 'Give me a fortune.' }]
        })
      })
      if (!response.ok) throw new Error("API Error")
      const data = await response.json()
      return data.content[0].text
    } catch {
      return FALLBACK_FORTUNES[Math.floor(Math.random() * FALLBACK_FORTUNES.length)]
    }
  }, [])

  const handleCrack = useCallback(async () => {
    if (status !== 'idle') return
    setStatus('shaking')

    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.warn("Audio play blocked", e))
    }

    const fortunePromise = fetchFortune()
    setTimeout(() => {
      setStatus('breaking')
      setTimeout(async () => {
        setStatus('loading')
        const result = await fortunePromise
        setFortune(result)
        setTimeout(() => setStatus('revealed'), 800)
      }, 600)
    }, 400)
  }, [status, fetchFortune])

  const reset = () => {
    setStatus('idle')
    setFortune('')
  }

  return (
    <div
      style={{ fontFamily: "'Playfair Display', serif", background: '#0a0a0a' }}
      className={`relative w-full h-[100dvh] overflow-hidden flex flex-col items-center justify-center select-none ${status === 'revealed' ? 'cursor-pointer' : ''}`}
      onClick={status === 'revealed' ? reset : undefined}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap');`}</style>

      {/* Subtle ambient glow behind cookie */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{
          width: 340, height: 340, background: 'radial-gradient(circle, rgba(201,151,58,0.12) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
      </div>

      {/* Top label */}
      <div style={{ color: 'rgba(201,151,58,0.7)', letterSpacing: '0.4em', fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}
        className="absolute top-12 uppercase italic pointer-events-none z-30 tracking-widest text-center px-4 w-full">
        Unfortunate Fortune Cookie
      </div>

      {/* Cookie + Break halves */}
      <div
        className="relative z-10 cursor-pointer"
        onClick={handleCrack}
        style={{ width: 280, height: 240, WebkitTapHighlightColor: 'transparent' }}
      >
        <AnimatePresence mode="wait">
          {(status === 'idle' || status === 'shaking') && (
            <motion.div
              key="whole-cookie"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={status === 'shaking' ? {
                scale: 1,
                opacity: 1,
                x: [0, -6, 6, -5, 5, -3, 3, 0],
                rotate: [0, -2, 2, -1.5, 1.5, 0],
              } : {
                scale: 1,
                opacity: 1,
                y: [0, -8, 0],
              }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={status === 'shaking'
                ? { duration: 0.4, ease: 'easeInOut' }
                : { y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.4 }, scale: { duration: 0.4 } }
              }
              style={{ width: '100%', height: '100%' }}
            >
              <CookieSVG />
            </motion.div>
          )}

          {(status === 'breaking' || status === 'loading' || status === 'revealed') && (
            <motion.div
              key="broken-cookie"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              style={{ width: '100%', height: '100%', position: 'relative' }}
            >
              {/* Left half */}
              <motion.div
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{ x: -130, y: -50, rotate: -40, opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              >
                <CookieLeftSVG />
              </motion.div>
              {/* Right half */}
              <motion.div
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{ x: 130, y: -50, rotate: 40, opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              >
                <CookieRightSVG />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Paper slip */}
      <AnimatePresence>
        {(status === 'loading' || status === 'revealed') && (
          <motion.div
            key="paper-slip"
            initial={{ y: -30, scaleY: 0, opacity: 0 }}
            animate={{ y: 0, scaleY: 1, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.175, 0.885, 0.32, 1.275], delay: 0.3 }}
            style={{
              transformOrigin: 'top center',
              background: '#F5F0E8',
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.6rem, #ddd8cf 1.6rem, #ddd8cf 1.7rem)',
              boxShadow: '0 12px 45px -8px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.8)',
              borderRadius: 2,
              padding: '1.7rem 2rem',
              width: '85%',
              maxWidth: 360,
              minHeight: 130,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className={`absolute z-20 ${status === 'revealed' ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}`}
            onClick={status === 'revealed' ? reset : undefined}
          >
            {status === 'loading' ? (
              <div style={{ display: 'flex', gap: 10, padding: '8px 0' }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.2, 0.9] }}
                    transition={{ duration: 1, repeat: Infinity, delay, ease: 'easeInOut' }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9973A' }}
                  />
                ))}
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  color: '#1a1a1a',
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  lineHeight: '1.7rem',
                  margin: 0,
                  transform: 'translateY(-0.15rem)',
                }}
              >
                {fortune}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap hint */}
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ color: 'rgba(201,151,58,0.5)', letterSpacing: '0.4em', fontSize: 18, textTransform: 'uppercase' }}
            className="absolute bottom-28 z-30 pointer-events-none"
          >
            tap to crack
          </motion.div>
        )}
      </AnimatePresence>

      {/* Another one button */}
      <AnimatePresence>
        {status === 'revealed' && (
          <motion.button
            key="another"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            onClick={reset}
            className="absolute bottom-28 z-40"
            style={{
              padding: '12px 40px',
              border: '1px solid #C9973A',
              color: '#C9973A',
              background: 'transparent',
              borderRadius: 999,
              fontSize: 10,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background 0.4s, color 0.4s',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#C9973A'; e.currentTarget.style.color = '#0a0a0a' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C9973A' }}
          >
            Another one
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}
        className="absolute bottom-10 z-30 pointer-events-none">
        Developed By Moegical
      </div>
    </div>
  )
}
