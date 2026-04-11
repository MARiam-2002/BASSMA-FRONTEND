import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { LoadingScreen } from './components/LoadingScreen'
import { Navbar } from './components/Navbar'
import { Portfolio } from './components/Portfolio'
import { Services } from './components/Services'
import { WhatsAppFloat } from './components/WhatsAppFloat'

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 2000)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <>
      <AnimatePresence>{loading && <LoadingScreen key="load" />}</AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.45 }}
      >
        <Navbar />
        <main>
          <Hero />
          <About />
          <Services />
          <Portfolio />
          <Contact />
        </main>
        <Footer />
        <WhatsAppFloat />
      </motion.div>
    </>
  )
}
