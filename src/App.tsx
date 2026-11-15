import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect } from 'react'
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router'

import { CartDrawer, Footer, Nav } from './components/Layout'
import { ToastProvider } from './components/Overlay'
import { StoreProvider } from './lib/store'
import { About } from './pages/About'
import { Checkout } from './pages/Checkout'
import { DishPage } from './pages/Dish'
import { Home } from './pages/Home'
import { MenuPage } from './pages/Menu'
import { NotFound } from './pages/NotFound'
import { OffersPage } from './pages/Offers'
import { OrderTracking, Orders } from './pages/Orders'
import { ReviewsPage } from './pages/Reviews'
import { Styleguide } from './pages/Styleguide'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        window.setTimeout(() => el.scrollIntoView(), 60)
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])
  return null
}

function Pages() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        id="main"
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-[70vh]"
      >
        <Routes location={location}>
          <Route index element={<Home />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="menu/:slug" element={<DishPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:reference" element={<OrderTracking />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="about" element={<About />} />
          <Route path="styleguide" element={<Styleguide />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  )
}

// A file on disk has no server to resolve paths, so it uses hash routes.
const Router = typeof window !== 'undefined' && window.location.protocol === 'file:' ? HashRouter : BrowserRouter

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <StoreProvider>
          <ToastProvider>
            <ScrollToTop />
            <Nav />
            <Pages />
            <Footer />
            <CartDrawer />
          </ToastProvider>
        </StoreProvider>
      </Router>
    </MotionConfig>
  )
}
