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

// Sketchfab 3D Embed Iframe
const CookieIframe = () => (
  <iframe
    title="Fortune Cookie"
    frameBorder="0"
    allowFullScreen
    allow="autoplay; fullscreen; xr-spatial-tracking"
    src="https://sketchfab.com/models/5a1c394155b14572a28ae9de39b0b1b3/embed?autostart=1&ui_infos=0&ui_watermark=0&ui_controls=0&ui_stop=0&transparent=1"
    style={{ width: '100%', height: '100%', pointerEvents: 'none', border: 'none' }}
  />
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
        <AnimatePresence mode="popLayout">
          {status !== 'idle' && status !== 'shaking' && status !== 'breaking' && status !== 'loading' && status !== 'revealed' ? null : (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={
                status === 'idle' ? { scale: 1, opacity: 1, y: [0, -8, 0] } :
                  status === 'shaking' ? { scale: 1, opacity: 1, x: [0, -6, 6, -5, 5, -3, 3, 0], rotate: [0, -2, 2, -1.5, 1.5, 0] } :
                    { scale: 1.5, opacity: 0, filter: 'blur(10px)' }
              }
              transition={
                status === 'idle' ? { y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } } :
                  status === 'shaking' ? { duration: 0.4, ease: 'easeInOut' } :
                    { duration: 0.6 }
              }
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <CookieIframe />
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
