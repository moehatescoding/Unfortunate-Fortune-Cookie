import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scene } from './components/Scene'

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
          model: 'claude-3-5-sonnet-20240620',
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

    // Simulate crack animation transition
    setTimeout(async () => {
      setStatus('loading')
      const result = await fortunePromise
      setFortune(result)
      setTimeout(() => setStatus('revealed'), 1000)
    }, 800)
  }, [status, fetchFortune])

  const reset = () => {
    setStatus('idle')
    setFortune('')
  }

  return (
    <div
      style={{ fontFamily: "'Playfair Display', serif", background: '#f8f6f2' }}
      className={`relative w-full h-[100dvh] overflow-hidden flex flex-col items-center justify-center select-none ${status === 'revealed' ? 'cursor-pointer' : ''}`}
      onClick={status === 'revealed' ? reset : undefined}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap');`}</style>

      {/* Top Title Overlay */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ color: '#8b5e1a', letterSpacing: '0.4em', fontSize: 'clamp(0.8rem, 2.5vw, 1rem)' }}
        className="absolute top-12 uppercase italic pointer-events-none z-30 tracking-widest text-center px-4 w-full"
      >
        Unfortunate Fortune Cookie
      </motion.div>

      {/* 3D Scene Container */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* Interaction Layer */}
      {status === 'idle' && (
        <div
          className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
          onClick={handleCrack}
        />
      )}

      {/* Paper Reveal UI Overlay */}
      <AnimatePresence>
        {(status === 'loading' || status === 'revealed') && (
          <motion.div
            key="paper-slip"
            initial={{ y: 200, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: '#F5F0E8',
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.6rem, #ddd8cf 1.6rem, #ddd8cf 1.7rem)',
              boxShadow: '0 20px 60px -15px rgba(0,0,0,0.3)',
              borderRadius: 4,
              padding: '2.5rem 3rem',
              width: '90%',
              maxWidth: 450,
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              border: '1px solid rgba(0,0,0,0.05)'
            }}
            className={status === 'revealed' ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}
            onClick={reset}
          >
            {status === 'loading' ? (
              <div style={{ display: 'flex', gap: 12 }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay, ease: 'easeInOut' }}
                    style={{ width: 10, height: 10, borderRadius: '50%', background: '#8b5e1a' }}
                  />
                ))}
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                style={{
                  color: '#2a1a0a',
                  fontStyle: 'italic',
                  fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
                  textAlign: 'center',
                  lineHeight: '1.6',
                  margin: 0,
                  fontWeight: 500
                }}
              >
                {fortune}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap Hint Overlay */}
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ color: '#8b5e1a', letterSpacing: '0.4em', fontSize: 13, textTransform: 'uppercase', bottom: '15dvh' }}
            className="absolute z-40 pointer-events-none font-sans"
          >
            Click to discover your fate
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      <div style={{ color: 'rgba(0,0,0,0.15)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', bottom: '6dvh' }}
        className="absolute z-30 pointer-events-none font-sans">
        Premium Experience by Moegical
      </div>
    </div>
  )
}

