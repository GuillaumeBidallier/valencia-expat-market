'use client'
import { useState, useRef, useTransition } from 'react'
import {
  Image as ImageIcon, Plus, Trash2, GripVertical, Save,
  Megaphone, Mail, ShieldAlert, CheckCircle2, AlertTriangle,
  Loader2, Upload, ExternalLink, ToggleLeft, ToggleRight,
  Database, RotateCcw, Download,
} from 'lucide-react'
import Image from 'next/image'

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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-primary ${checked ? 'bg-indigo-primary' : 'bg-gray-200'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}

export default function SettingsClient({ initialSettings }: { initialSettings: InitialSettings }) {
  const [autoPublish, setAutoPublish]             = useState(initialSettings.autoPublish)
  const [heroImages, setHeroImages]               = useState<HeroSlide[]>(initialSettings.heroImages)
  const [announcementText, setAnnouncementText]   = useState(initialSettings.announcementText)
  const [announcementEnabled, setAnnouncementEnabled] = useState(initialSettings.announcementEnabled)
  const [contactEmail, setContactEmail]           = useState(initialSettings.contactEmail)
  const [maintenanceMode, setMaintenanceMode]     = useState(initialSettings.maintenanceMode)

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
          body: JSON.stringify({
            autoPublish,
            heroImages,
            announcementText,
            announcementEnabled,
            contactEmail,
            maintenanceMode,
          }),
        })
        if (!res.ok) {
          const j = await res.json()
          throw new Error(j.error ?? 'Erreur')
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (err) {
        setSaveError((err as Error).message)
      }
    })
  }

  return (
    <div className="space-y-6">

      {/* ── Images Hero ─────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-soft flex items-center justify-center">
            <ImageIcon size={18} className="text-indigo-primary" />
          </div>
          <div>
            <h2 className="font-black text-navy text-sm">Images du carrousel hero</h2>
            <p className="text-xs text-gray-400 mt-0.5">Glissez pour réordonner. Ces images s&apos;affichent sur la page d&apos;accueil.</p>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {heroImages.length === 0 && (
            <p className="text-sm text-gray-400 italic py-4 text-center border-2 border-dashed border-gray-100 rounded-xl">
              Aucune image — les images par défaut seront utilisées.
            </p>
          )}

          {heroImages.map((slide, i) => (
            <div
              key={`${slide.src}-${i}`}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDragEnd={onDragEnd}
              className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 group cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={16} className="text-gray-300 shrink-0" />
              <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-navy truncate">{slide.alt || 'Sans titre'}</p>
                <p className="text-[10px] text-gray-400 truncate">{slide.src}</p>
              </div>
              <a
                href={slide.src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-indigo-primary transition-colors shrink-0"
                title="Voir l'image"
              >
                <ExternalLink size={14} />
              </a>
              <button
                onClick={() => removeSlide(i)}
                className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Add by URL */}
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ajouter une image</p>
            <div className="flex gap-2">
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
                className="w-48 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-primary/30 focus:border-indigo-primary"
              />
              <button
                onClick={addSlide}
                disabled={!newSrc.trim()}
                className="flex items-center gap-1.5 bg-indigo-primary text-white text-sm font-semibold px-4 rounded-xl hover:bg-indigo-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={15} />
                Ajouter
              </button>
            </div>

            {/* Upload from computer */}
            <div className="flex items-center gap-3">
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
                className="flex items-center gap-2 border border-dashed border-gray-300 text-sm text-gray-500 font-medium px-4 py-2.5 rounded-xl hover:border-indigo-primary hover:text-indigo-primary transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {uploading ? 'Upload en cours...' : 'Télécharger depuis votre ordinateur'}
              </button>
              {uploadError && (
                <p className="text-xs text-red-500 mt-1">{uploadError}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bannière d'annonce ──────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Megaphone size={18} className="text-amber-500" />
            </div>
            <div>
              <h2 className="font-black text-navy text-sm">Bannière d&apos;annonce</h2>
              <p className="text-xs text-gray-400 mt-0.5">Message affiché en haut du site pour tous les visiteurs.</p>
            </div>
          </div>
          <Toggle checked={announcementEnabled} onChange={setAnnouncementEnabled} />
        </div>
        <div className="p-6">
          <textarea
            rows={2}
            placeholder="Ex : Le site sera en maintenance samedi de 22h à 23h. Merci de votre compréhension."
            value={announcementText}
            onChange={e => setAnnouncementText(e.target.value)}
            disabled={!announcementEnabled}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 disabled:opacity-40 disabled:bg-gray-50"
          />
          {announcementEnabled && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <strong>Aperçu :</strong> {announcementText || '(vide)'}
            </div>
          )}
        </div>
      </section>

      {/* ── Publication auto ────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>
            <div>
              <h2 className="font-black text-navy text-sm">Publication automatique</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {autoPublish
                  ? 'Les nouvelles annonces sont publiées immédiatement.'
                  : 'Les nouvelles annonces passent en modération avant publication.'}
              </p>
            </div>
          </div>
          <Toggle checked={autoPublish} onChange={setAutoPublish} />
        </div>
      </section>

      {/* ── Email de contact ─────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Mail size={18} className="text-blue-500" />
          </div>
          <div>
            <h2 className="font-black text-navy text-sm">Email de contact</h2>
            <p className="text-xs text-gray-400 mt-0.5">Adresse affichée sur les pages légales et contact.</p>
          </div>
        </div>
        <div className="p-6">
          <input
            type="email"
            placeholder="contact@1000click.es"
            value={contactEmail}
            onChange={e => setContactEmail(e.target.value)}
            className="w-full max-w-md text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-primary/30 focus:border-indigo-primary"
          />
        </div>
      </section>

      {/* ── Mode maintenance ─────────────────────────────────── */}
      <section className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${maintenanceMode ? 'border-red-200' : 'border-gray-100'}`}>
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${maintenanceMode ? 'bg-red-50' : 'bg-gray-50'}`}>
              <ShieldAlert size={18} className={maintenanceMode ? 'text-red-500' : 'text-gray-400'} />
            </div>
            <div>
              <h2 className="font-black text-navy text-sm">Mode maintenance</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {maintenanceMode
                  ? 'Le site affiche une page de maintenance pour les visiteurs.'
                  : 'Le site est accessible normalement.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {maintenanceMode && (
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">ACTIF</span>
            )}
            <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
          </div>
        </div>
        {maintenanceMode && (
          <div className="mx-6 mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            Attention : le site sera inaccessible aux visiteurs tant que ce mode est activé.
          </div>
        )}
      </section>

      {/* ── Outils base de données ───────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
            <Database size={18} className="text-gray-400" />
          </div>
          <div>
            <h2 className="font-black text-navy text-sm">Outils base de données</h2>
            <p className="text-xs text-gray-400 mt-0.5">Export et réinitialisation des données — actions irréversibles</p>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Export */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-navy">Exporter la base de données</p>
              <p className="text-xs text-gray-400 mt-0.5">Télécharge un fichier JSON complet (utilisateurs sans mot de passe, annonces, pros, messages…)</p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 shrink-0 bg-navy text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-60"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {exporting ? 'Export…' : 'Exporter'}
            </button>
          </div>

          {/* Reset professionals */}
          <div className={`rounded-xl border px-4 py-3 ${resetStep === 'confirm' ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-navy">Réinitialiser les comptes professionnels</p>
                <p className="text-xs text-gray-400 mt-0.5">Supprime <strong>tous</strong> les profils Pro, leurs clics et cartes de visite. Les comptes utilisateurs associés sont conservés.</p>
              </div>
              {resetStep === 'idle' ? (
                <button
                  onClick={() => { setResetStep('confirm'); setResetResult(null); setResetError('') }}
                  disabled={resetting}
                  className="flex items-center gap-2 shrink-0 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  <RotateCcw size={14} />
                  Réinitialiser
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setResetStep('idle')}
                    className="text-xs font-bold text-gray-500 px-3 py-2 rounded-xl border border-gray-200 hover:bg-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
                  >
                    {resetting ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                    {resetting ? 'Suppression…' : 'Confirmer la suppression'}
                  </button>
                </div>
              )}
            </div>

            {resetStep === 'confirm' && (
              <p className="mt-3 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                <AlertTriangle size={13} className="shrink-0" />
                Cette action est irréversible. Tous les profils professionnels seront définitivement supprimés.
              </p>
            )}
            {resetResult && (
              <p className="mt-3 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="shrink-0" />
                {resetResult.count} profil{resetResult.count !== 1 ? 's' : ''} professionnel{resetResult.count !== 1 ? 's' : ''} supprimé{resetResult.count !== 1 ? 's' : ''} avec succès.
              </p>
            )}
            {resetError && (
              <p className="mt-3 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                <AlertTriangle size={13} className="shrink-0" />
                {resetError}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Save button ──────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-8">
        {saveError && (
          <p className="text-sm text-red-500">{saveError}</p>
        )}
        {saved && (
          <p className="text-sm text-emerald-600 flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={15} />
            Paramètres sauvegardés
          </p>
        )}
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-navy text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  )
}
