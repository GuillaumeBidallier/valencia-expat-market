'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, MousePointerClick, X } from 'lucide-react'
import { TOUR_STEPS, type TourStep } from './steps'

// Guided tour of the admin area. Everything but the highlighted element is
// blurred; "click" steps make the admin press the real button, and the tour
// follows them onto the next page. Starts on its own until the admin has
// finished or skipped it once (User.adminTourCompletedAt), and can be replayed
// from the sidebar through the START_EVENT window event.

export const START_EVENT = 'admin-tour:start'
const STORAGE_KEY = 'adminTour.step'
const PAD = 8
const CARD_W = 360
const GAP = 16

type Rect = { top: number; left: number; width: number; height: number }

function readStoredStep(): number | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY)
    return v === null ? null : Number(v)
  } catch {
    return null
  }
}

function storeStep(i: number | null) {
  try {
    if (i === null) sessionStorage.removeItem(STORAGE_KEY)
    else sessionStorage.setItem(STORAGE_KEY, String(i))
  } catch {}
}

function samePath(pathname: string, stepPath: string) {
  return pathname === stepPath.split('#')[0]
}

function findTarget(step: TourStep): HTMLElement | null {
  if (!step.target) return null
  return document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
}

function cardPosition(rect: Rect | null, cardH: number, vw: number, vh: number) {
  if (!rect) return { top: Math.max(GAP, (vh - cardH) / 2), left: Math.max(GAP, (vw - CARD_W) / 2) }
  const clampTop = (t: number) => Math.min(Math.max(GAP, t), vh - cardH - GAP)
  const clampLeft = (l: number) => Math.min(Math.max(GAP, l), vw - CARD_W - GAP)
  const right = rect.left + rect.width + PAD + GAP
  const below = rect.top + rect.height + PAD + GAP
  if (right + CARD_W <= vw - GAP) return { top: clampTop(rect.top + rect.height / 2 - cardH / 2), left: right }
  if (below + cardH <= vh - GAP) return { top: below, left: clampLeft(rect.left + rect.width / 2 - CARD_W / 2) }
  const above = rect.top - PAD - GAP - cardH
  if (above >= GAP) return { top: above, left: clampLeft(rect.left + rect.width / 2 - CARD_W / 2) }
  const left = rect.left - PAD - GAP - CARD_W
  if (left >= GAP) return { top: clampTop(rect.top + rect.height / 2 - cardH / 2), left }
  // Target covers most of the screen: pin the card to the bottom-right corner.
  return { top: vh - cardH - GAP, left: vw - CARD_W - GAP }
}

export default function AdminTour({ autoStart }: { autoStart: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const [index, setIndex] = useState<number | null>(null)
  const [rect, setRect] = useState<Rect | null>(null)
  const [searching, setSearching] = useState(false)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const [cardH, setCardH] = useState(240)
  const cardRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLElement | null>(null)
  const navigatingByClick = useRef(false)

  const step = index === null ? null : TOUR_STEPS[index]
  const isLast = index === TOUR_STEPS.length - 1

  // Start: resume after a reload, or auto-start on first visit.
  useEffect(() => {
    // Deferred: sessionStorage only exists in the browser, after hydration.
    const t = setTimeout(() => {
      const stored = readStoredStep()
      if (stored !== null && stored >= 0 && stored < TOUR_STEPS.length) setIndex(stored)
      else if (autoStart) setIndex(0)
    }, 0)
    const start = () => setIndex(0)
    window.addEventListener(START_EVENT, start)
    return () => {
      clearTimeout(t)
      window.removeEventListener(START_EVENT, start)
    }
  }, [autoStart])

  useEffect(() => { storeStep(index) }, [index])

  const finish = useCallback(() => {
    setIndex(null)
    setRect(null)
    storeStep(null)
    fetch('/api/admin/tour', { method: 'POST' }).catch(() => {})
  }, [])

  const go = useCallback((next: number) => {
    if (next < 0) return
    if (next >= TOUR_STEPS.length) return finish()
    setIndex(next)
  }, [finish])

  // Bring the admin to the page the step lives on.
  useEffect(() => {
    if (!step) return
    if (samePath(pathname, step.path)) {
      navigatingByClick.current = false
      return
    }
    if (!navigatingByClick.current) router.push(step.path)
  }, [step, pathname, router])

  // Locate the highlighted element (it may render a moment after navigation).
  useEffect(() => {
    targetRef.current = null
    let tries = 0
    const id = window.setInterval(() => {
      if (tries === 0) setRect(null)
      if (!step?.target || !samePath(pathname, step.path)) {
        window.clearInterval(id)
        setSearching(!!step?.target)
        return
      }
      setSearching(true)
      const el = findTarget(step)
      if (el || ++tries > 40) {
        window.clearInterval(id)
        setSearching(false)
        if (el) {
          targetRef.current = el
          el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
        }
      }
    }, 100)
    return () => window.clearInterval(id)
  }, [step, pathname])

  // Follow the element as the page scrolls, resizes or re-renders.
  useEffect(() => {
    if (!step) return
    let raf = 0
    const tick = () => {
      setViewport(v => (v.w === window.innerWidth && v.h === window.innerHeight ? v : { w: window.innerWidth, h: window.innerHeight }))
      const el = targetRef.current
      if (el && el.isConnected) {
        const r = el.getBoundingClientRect()
        setRect(prev =>
          prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height
            ? prev
            : { top: r.top, left: r.left, width: r.width, height: r.height },
        )
      }
      if (cardRef.current) {
        const h = cardRef.current.offsetHeight
        setCardH(prev => (prev === h ? prev : h))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [step])

  // "Click" steps advance when the admin presses the real element.
  useEffect(() => {
    const el = targetRef.current
    if (!step || step.action !== 'click' || !el || index === null) return
    const onClick = () => {
      const next = TOUR_STEPS[index + 1]
      navigatingByClick.current = !!next && !samePath(pathname, next.path)
      go(index + 1)
    }
    el.addEventListener('click', onClick, { capture: true })
    return () => el.removeEventListener('click', onClick, { capture: true })
  }, [step, index, rect === null, pathname, go]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard: arrows to move, Escape to quit.
  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      else if (e.key === 'ArrowRight') go(index + 1)
      else if (e.key === 'ArrowLeft') go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, go, finish])

  if (!step || index === null || viewport.w === 0) return null

  const hole = rect && {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  }
  const pos = cardPosition(hole ? rect : null, cardH, viewport.w, viewport.h)
  const blur = 'fixed pointer-events-auto bg-[#1A1F36]/55 backdrop-blur-[3px] transition-all duration-500 ease-out'
  const total = TOUR_STEPS.length
  const isWelcome = index === 0

  return createPortal(
    <div className="admin-tour fixed inset-0 z-[10000] pointer-events-none" role="dialog" aria-modal="true" aria-labelledby="admin-tour-title">
      {hole ? (
        <>
          <div className={blur} style={{ top: 0, left: 0, width: '100%', height: Math.max(0, hole.top) }} />
          <div className={blur} style={{ top: hole.top + hole.height, left: 0, width: '100%', bottom: 0 }} />
          <div className={blur} style={{ top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.height }} />
          <div className={blur} style={{ top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }} />
          <div
            className="admin-tour-ring fixed rounded-xl pointer-events-none transition-all duration-500 ease-out"
            style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
          />
          {/* Explanation steps: the element is shown, not usable. */}
          {step.action !== 'click' && (
            <div className="fixed pointer-events-auto" style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }} />
          )}
        </>
      ) : (
        <div className={`${blur} inset-0`} />
      )}

      <div
        ref={cardRef}
        key={index}
        className="admin-tour-card fixed pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-[top,left] duration-500 ease-out"
        style={{ top: pos.top, left: pos.left, width: CARD_W }}
      >
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-orange-primary transition-all duration-500" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-primary">
              {isWelcome ? 'Bienvenue' : `Étape ${index} / ${total - 1}`}
            </span>
            <button
              type="button"
              onClick={finish}
              aria-label="Fermer le guide"
              className="w-7 h-7 -mr-1 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-navy"
            >
              <X size={15} />
            </button>
          </div>
          {step.emoji && <div className="text-3xl mb-2" aria-hidden="true">{step.emoji}</div>}
          <h2 id="admin-tour-title" className="font-black text-navy text-lg leading-snug mb-2">{step.title}</h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-2">{step.body}</div>

          {step.action === 'click' && rect && (
            <p className="admin-tour-hint mt-4 flex items-center gap-2 text-sm font-bold text-orange-primary bg-orange-50 rounded-lg px-3 py-2">
              <MousePointerClick size={16} className="shrink-0" />
              {step.hint ?? 'Cliquez sur l’élément en surbrillance'}
            </p>
          )}
          {step.target && !rect && !searching && (
            <p className="mt-3 text-xs text-gray-400">Cet élément n’est pas affiché pour le moment — il apparaîtra dès qu’il y aura des données.</p>
          )}

          <div className="flex items-center justify-between gap-2 mt-5">
            <button type="button" onClick={finish} className="text-xs font-semibold text-gray-400 hover:text-navy">
              {isWelcome ? 'Passer le guide' : 'Quitter'}
            </button>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-semibold text-navy hover:bg-gray-50 flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Précédent
                </button>
              )}
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="h-9 px-4 rounded-lg bg-orange-primary hover:bg-orange-dark text-white text-sm font-bold flex items-center gap-1"
              >
                {isWelcome ? 'Commencer la visite' : isLast ? 'Terminer' : step.action === 'click' ? 'Passer' : 'Suivant'}
                {!isLast && <ArrowRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
