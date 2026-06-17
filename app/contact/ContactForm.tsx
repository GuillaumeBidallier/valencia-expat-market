'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle } from 'lucide-react'

const SUBJECTS = [
  'Question générale',
  'Problème avec mon compte',
  'Signalement d\'une annonce',
  'Référencer mon activité professionnelle',
  'Partenariat / presse',
  'Autre',
]

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [loadedAt] = useState(() => Date.now())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website: (e.target as HTMLFormElement).website.value, loadedAt }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-primary/30 focus:border-orange-primary transition-colors bg-white'
  const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-xl font-black text-navy mb-2">Message envoyé !</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Merci pour votre message. Nous vous répondrons par email sous 24-48h. Un email de confirmation vous a été envoyé.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot — hidden from real users via CSS, bots tend to fill every field */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] w-px h-px opacity-0"
      />
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Votre nom *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Marie Dupont"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Votre email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="marie@exemple.com"
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Sujet *</label>
        <select
          required
          value={form.subject}
          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          className={inputCls}
        >
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Message *</label>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="Décrivez votre demande en détail…"
          className={inputCls}
          maxLength={2000}
        />
        <p className="text-right text-xs text-gray-400 mt-1">{form.message.length}/2000</p>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
          Une erreur est survenue. Veuillez réessayer ou nous écrire directement à <a href="mailto:contact@vendo.es" className="underline">contact@vendo.es</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full flex items-center justify-center gap-2 bg-orange-primary hover:bg-orange-dark text-white font-black py-3.5 rounded-xl transition-colors disabled:opacity-60"
      >
        {status === 'sending' ? (
          <><Loader2 size={16} className="animate-spin" /> Envoi en cours…</>
        ) : (
          <><Send size={16} /> Envoyer le message</>
        )}
      </button>
    </form>
  )
}
