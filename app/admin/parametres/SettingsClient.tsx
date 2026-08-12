'use client'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import {
  Image as ImageIcon, Plus, Trash2, GripVertical, Save,
  Megaphone, Mail, ShieldAlert, CheckCircle2, AlertTriangle,
  Loader2, Upload, ExternalLink, Database, RotateCcw, Download,
  Settings2, X, Info,
} from 'lucide-react'

interface HeroSlide { src: string; alt: string }

interface InitialSettings {
  autoPublish: boolean
  heroImages: HeroSlide[]
  announcementText: string
  announcementEnabled: boolean
  contactEmail: string
  maintenanceMode: boolean
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-primary shrink-0 ${checked ? 'bg-indigo-primary' : 'bg-gray-200'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}

function SectionCard({
  icon, iconBg, iconColor, title, sub, right, children,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string; title: string; sub: string
  right?: React.ReactNode; children?: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <span className={iconColor}>{icon}</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-navy text-sm">{title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        </div>
        {right}
      </div>
      {children && <div className="p-6">{children}</div>}
    </section>
  )
}

const TABS = [
  { key: 'general',     label: 'Général',          icon: <Settings2 size={16} /> },
  { key: 'apparence',   label: 'Apparence',         icon: <ImageIcon size={16} /> },
  { key: 'annonce',     label: 'Bannière du site',  icon: <Megaphone size={16} /> },
  { key: 'maintenance', label: 'Maintenance',       icon: <ShieldAlert size={16} /> },
  { key: 'database',    label: 'Base de données',   icon: <Database size={16} /> },
] as const

type TabKey = typeof TABS[number]['key']

export default function SettingsClient({ initialSettings }: { initialSettings: InitialSettings }) {
  const [activeTab, setActiveTab] = useState<TabKey>('general')

  const [autoPublish, setAutoPublish]             = useState(initialSettings.autoPublish)
  const [heroImages, setHeroImages]               = useState<HeroSlide[]>(initialSettings.heroImages)
  const [announcementText, setAnnouncementText]   = useState(initialSettings.announcementText)
  const [announcementEnabled, setAnnouncementEnabled] = useState(initialSettings.announcementEnabled)
  const [contactEmail, setContactEmail]           = useState(initialSettings.contactEmail)
  const [maintenanceMode, setMaintenanceMode]     = useState(initialSettings.maintenanceMode)

  const [savedSettings, setSavedSettings] = useState(initialSettings)

  const [newSrc, setNewSrc]   = useState('')
  const [newAlt, setNewAlt]   = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [saving, startSave]   = useTransition()
  const [saved, setSaved]     = useState(false)
  const [saveError, setSaveError] = useState('')

  // Database tools state
  const [exporting, setExporting]     = useState(false)
  const [resetStep, setResetStep]     = useState<'idle' | 'confirm'>('idle')
  const [resetting, setResetting]     = useState(false)
  const [resetResult, setResetResult] = useState<{ count: number } | null>(null)
  const [resetError, setResetError]   = useState('')

  const [resetListingsStep, setResetListingsStep]     = useState<'idle' | 'confirm'>('idle')
  const [resettingListings, setResettingListings]     = useState(false)
  const [resetListingsResult, setResetListingsResult] = useState<{ count: number } | null>(null)
  const [resetListingsError, setResetListingsError]   = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      if (window.location.hash === '#maintenance') setActiveTab('maintenance')
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const current = useMemo(
    () => ({ autoPublish, heroImages, announcementText, announcementEnabled, contactEmail, maintenanceMode }),
    [autoPublish, heroImages, announcementText, announcementEnabled, contactEmail, maintenanceMode],
  )
  const isDirty = useMemo(() => JSON.stringify(current) !== JSON.stringify(savedSettings), [current, savedSettings])

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/database/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      const date = new Date().toISOString().split('T')[0]
      a.download = `backup-1000click-${date}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Erreur lors de l'export de la base de données.")
    } finally {
      setExporting(false)
    }
  }

  async function handleReset() {
    setResetting(true)
    setResetError('')
    setResetResult(null)
    try {
      const res  = await fetch('/api/admin/database/reset-professionals', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur inconnue')
      setResetResult({ count: data.deleted })
      setResetStep('idle')
    } catch (e) {
      setResetError(e instanceof Error ? e.message : 'Erreur inconnue')
      setResetStep('idle')
    } finally {
      setResetting(false)
    }
  }

  async function handleResetListings() {
    setResettingListings(true)
    setResetListingsError('')
    setResetListingsResult(null)
    try {
      const res  = await fetch('/api/admin/database/reset-listings', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur inconnue')
      setResetListingsResult({ count: data.deleted })
      setResetListingsStep('idle')
    } catch (e) {
      setResetListingsError(e instanceof Error ? e.message : 'Erreur inconnue')
      setResetListingsStep('idle')
    } finally {
      setResettingListings(false)
    }
  }

  // Drag state
  const dragIdx = useRef<number | null>(null)

  function onDragStart(i: number) { dragIdx.current = i }
  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragIdx.current === null || dragIdx.current === i) return
    const reordered = [...heroImages]
    const [moved] = reordered.splice(dragIdx.current, 1)
    reordered.splice(i, 0, moved)
    dragIdx.current = i
    setHeroImages(reordered)
  }
  function onDragEnd() { dragIdx.current = null }

  function removeSlide(i: number) {
    setHeroImages(imgs => imgs.filter((_, idx) => idx !== i))
  }

  function addSlide() {
    const src = newSrc.trim()
    if (!src) return
    setHeroImages(imgs => [...imgs, { src, alt: newAlt.trim() || 'Image hero' }])
    setNewSrc('')
    setNewAlt('')
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-hero', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erreur upload')
      setHeroImages(imgs => [...imgs, { src: json.url, alt: file.name.replace(/\.[^/.]+$/, '') }])
    } catch (err) {
      setUploadError((err as Error).message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function save() {
    setSaved(false)
    setSaveError('')
    startSave(async () => {
      try {
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current),
        })
        if (!res.ok) {
          const j = await res.json()
          throw new Error(j.error ?? 'Erreur')
        }
        setSavedSettings(current)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (err) {
        setSaveError((err as Error).message)
      }
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6">

      {/* ── Tab nav ─────────────────────────────────────────── */}
      <nav className="flex sm:flex-col gap-1 sm:w-56 shrink-0 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 sm:sticky sm:top-6 sm:self-start">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors shrink-0 sm:shrink ${
              activeTab === tab.key
                ? 'bg-navy text-white shadow-sm'
                : 'text-gray-500 hover:bg-white hover:text-navy'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.key === 'maintenance' && maintenanceMode && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            )}
          </button>
        ))}
      </nav>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Save bar */}
        <div className="flex items-center justify-end gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          {saved && (
            <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={15} /> Paramètres sauvegardés
            </p>
          )}
          {!saved && !saveError && isDirty && (
            <p className="text-sm text-amber-600 flex items-center gap-1.5 font-medium">
              <Info size={15} /> Modifications non enregistrées
            </p>
          )}
          <button
            onClick={save}
            disabled={saving || !isDirty}
            className="flex items-center gap-2 bg-orange-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-orange-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>

        {/* ── Général ─────────────────────────────────────────── */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard
              icon={<CheckCircle2 size={18} />} iconBg="bg-emerald-50" iconColor="text-emerald-500"
              title="Publication automatique"
              sub={autoPublish ? 'Les nouvelles annonces sont publiées immédiatement.' : 'Les nouvelles annonces passent en modération avant publication.'}
              right={<Toggle checked={autoPublish} onChange={setAutoPublish} />}
            />
            <SectionCard
              icon={<Mail size={18} />} iconBg="bg-blue-50" iconColor="text-blue-500"
              title="Email de contact"
              sub="Adresse affichée sur les pages légales et contact."
            >
              <input
                type="email"
                placeholder="contact@1000click.com"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-primary/30 focus:border-indigo-primary"
              />
            </SectionCard>
          </div>
        )}

        {/* ── Apparence (hero carousel) ─────────────────────────── */}
        {activeTab === 'apparence' && (
          <SectionCard
            icon={<ImageIcon size={18} />} iconBg="bg-indigo-soft" iconColor="text-indigo-primary"
            title="Images du carrousel hero"
            sub="Glissez pour réordonner. Ces images s'affichent sur la page d'accueil."
          >
            {heroImages.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-8 text-center border-2 border-dashed border-gray-100 rounded-xl mb-5">
                Aucune image — les images par défaut seront utilisées.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {heroImages.map((slide, i) => (
                  <div
                    key={`${slide.src}-${i}`}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragOver={e => onDragOver(e, i)}
                    onDragEnd={onDragEnd}
                    className="group relative rounded-xl overflow-hidden bg-gray-100 border border-gray-100 cursor-grab active:cursor-grabbing"
                  >
                    <div className="aspect-video w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={13} className="text-gray-500" />
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={slide.src} target="_blank" rel="noopener noreferrer"
                        className="w-6 h-6 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center text-gray-600"
                        title="Voir l'image"
                      >
                        <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => removeSlide(i)}
                        className="w-6 h-6 rounded-lg bg-white/90 hover:bg-red-500 hover:text-white flex items-center justify-center text-red-500"
                        title="Supprimer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[11px] font-medium px-2 py-1.5 truncate">
                      {slide.alt || 'Sans titre'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 pt-5 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ajouter une image</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://... (URL de l'image)"
                  value={newSrc}
                  onChange={e => setNewSrc(e.target.value)}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-primary/30 focus:border-indigo-primary"
                />
                <input
                  type="text"
                  placeholder="Texte alternatif"
                  value={newAlt}
                  onChange={e => setNewAlt(e.target.value)}
                  className="sm:w-56 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-primary/30 focus:border-indigo-primary"
                />
                <button
                  onClick={addSlide}
                  disabled={!newSrc.trim()}
                  className="flex items-center justify-center gap-1.5 bg-indigo-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={15} />
                  Ajouter
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-xs text-gray-400">ou</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 text-sm text-gray-500 font-medium px-4 py-3 rounded-xl hover:border-indigo-primary hover:text-indigo-primary transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  {uploading ? 'Upload en cours...' : 'Télécharger depuis votre ordinateur'}
                </button>
                {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Bannière d'annonce ─────────────────────────────────── */}
        {activeTab === 'annonce' && (
          <SectionCard
            icon={<Megaphone size={18} />} iconBg="bg-amber-50" iconColor="text-amber-500"
            title="Bannière d'annonce"
            sub="Message affiché en haut du site pour tous les visiteurs."
            right={<Toggle checked={announcementEnabled} onChange={setAnnouncementEnabled} />}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Message</label>
                <textarea
                  rows={5}
                  placeholder="Ex : Le site sera en maintenance samedi de 22h à 23h. Merci de votre compréhension."
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  disabled={!announcementEnabled}
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 disabled:opacity-40 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Aperçu</label>
                <div className={`rounded-xl border overflow-hidden ${announcementEnabled ? 'border-amber-200' : 'border-gray-100 opacity-50'}`}>
                  <div className="bg-amber-400 text-navy text-sm font-semibold px-4 py-2.5 flex items-center justify-between gap-3">
                    <span className="truncate">{announcementText || 'Votre message apparaîtra ici…'}</span>
                    <X size={14} className="shrink-0" />
                  </div>
                  <div className="bg-white px-4 py-6 text-center text-xs text-gray-300">Reste du site…</div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {announcementEnabled ? 'Cette bannière est actuellement visible sur le site.' : 'La bannière est désactivée — activez-la pour la publier.'}
                </p>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Maintenance ─────────────────────────────────────────── */}
        {activeTab === 'maintenance' && (
          <div id="maintenance" className="scroll-mt-6">
            <SectionCard
              icon={<ShieldAlert size={18} />}
              iconBg={maintenanceMode ? 'bg-red-50' : 'bg-gray-50'}
              iconColor={maintenanceMode ? 'text-red-500' : 'text-gray-400'}
              title="Mode maintenance"
              sub={maintenanceMode ? 'Le site affiche une page de maintenance pour les visiteurs.' : 'Le site est accessible normalement.'}
              right={
                <div className="flex items-center gap-3">
                  {maintenanceMode && (
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">ACTIF</span>
                  )}
                  <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
                </div>
              }
            >
              <div className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2.5 ${
                maintenanceMode ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}>
                <AlertTriangle size={15} className="shrink-0" />
                {maintenanceMode
                  ? 'Attention : le site est actuellement inaccessible aux visiteurs.'
                  : 'Activer ce mode rendra le site inaccessible aux visiteurs jusqu\'à désactivation.'}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ── Base de données ─────────────────────────────────────── */}
        {activeTab === 'database' && (
          <SectionCard
            icon={<Database size={18} />} iconBg="bg-gray-50" iconColor="text-gray-400"
            title="Outils base de données"
            sub="Export et réinitialisation des données — actions irréversibles."
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Export */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center">
                  <Download size={16} className="text-navy" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">Exporter la base de données</p>
                  <p className="text-xs text-gray-400 mt-1">Télécharge un fichier JSON complet (utilisateurs sans mot de passe, annonces, pros, messages…)</p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="mt-auto flex items-center justify-center gap-2 bg-navy text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-60"
                >
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  {exporting ? 'Export…' : 'Exporter'}
                </button>
              </div>

              {/* Reset professionals */}
              <div className={`rounded-xl border p-4 flex flex-col gap-3 ${resetStep === 'confirm' ? 'border-red-200 bg-red-50' : 'border-red-100 bg-red-50/40'}`}>
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                  <RotateCcw size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">Réinitialiser les professionnels</p>
                  <p className="text-xs text-gray-400 mt-1">Supprime <strong>tous</strong> les profils Pro, leurs clics et cartes de visite. Comptes utilisateurs conservés.</p>
                </div>
                {resetStep === 'idle' ? (
                  <button
                    onClick={() => { setResetStep('confirm'); setResetResult(null); setResetError('') }}
                    disabled={resetting}
                    className="mt-auto flex items-center justify-center gap-2 bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    <RotateCcw size={14} />
                    Réinitialiser
                  </button>
                ) : (
                  <div className="mt-auto space-y-2">
                    <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                      <AlertTriangle size={12} className="shrink-0" /> Action irréversible.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setResetStep('idle')}
                        className="flex-1 text-xs font-bold text-gray-500 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleReset}
                        disabled={resetting}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
                      >
                        {resetting ? <Loader2 size={13} className="animate-spin" /> : <AlertTriangle size={13} />}
                        Confirmer
                      </button>
                    </div>
                  </div>
                )}
                {resetResult && (
                  <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="shrink-0" />
                    {resetResult.count} profil{resetResult.count !== 1 ? 's' : ''} supprimé{resetResult.count !== 1 ? 's' : ''}.
                  </p>
                )}
                {resetError && (
                  <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" /> {resetError}
                  </p>
                )}
              </div>

              {/* Reset listings */}
              <div className={`rounded-xl border p-4 flex flex-col gap-3 ${resetListingsStep === 'confirm' ? 'border-red-200 bg-red-50' : 'border-red-100 bg-red-50/40'}`}>
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                  <RotateCcw size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy">Réinitialiser les annonces</p>
                  <p className="text-xs text-gray-400 mt-1">Supprime <strong>toutes</strong> les annonces, images, favoris, messages et signalements. Comptes utilisateurs conservés.</p>
                </div>
                {resetListingsStep === 'idle' ? (
                  <button
                    onClick={() => { setResetListingsStep('confirm'); setResetListingsResult(null); setResetListingsError('') }}
                    disabled={resettingListings}
                    className="mt-auto flex items-center justify-center gap-2 bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    <RotateCcw size={14} />
                    Réinitialiser
                  </button>
                ) : (
                  <div className="mt-auto space-y-2">
                    <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                      <AlertTriangle size={12} className="shrink-0" /> Action irréversible.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setResetListingsStep('idle')}
                        className="flex-1 text-xs font-bold text-gray-500 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleResetListings}
                        disabled={resettingListings}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
                      >
                        {resettingListings ? <Loader2 size={13} className="animate-spin" /> : <AlertTriangle size={13} />}
                        Confirmer
                      </button>
                    </div>
                  </div>
                )}
                {resetListingsResult && (
                  <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="shrink-0" />
                    {resetListingsResult.count} annonce{resetListingsResult.count !== 1 ? 's' : ''} supprimée{resetListingsResult.count !== 1 ? 's' : ''}.
                  </p>
                )}
                {resetListingsError && (
                  <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0" /> {resetListingsError}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  )
}
