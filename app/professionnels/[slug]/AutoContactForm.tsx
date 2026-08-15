'use client'
import { useState } from 'react'
import { Mail, Phone, Send, CheckCircle2 } from 'lucide-react'

type Reason = 'achat' | 'essai' | 'reprise'

type Strings = {
  title: string
  contact_method: string
  by_email: string
  by_phone: string
  name: string
  email: string
  phone: string
  reason_label: string
  reason_achat: string
  reason_essai: string
  reason_reprise: string
  message: string
  message_optional: string
  send: string
  sending: string
  sent_title: string
  sent_body: string
  error_generic: string
}

export default function AutoContactForm({ proId, strings }: { proId: string; strings: Strings }) {
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [reason, setReason] = useState<Reason>('achat')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      const res = await fetch('/api/pro/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proId, name, email, phone, contactMethod, reason, message, website }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? strings.error_generic)
        return
      }
      setSent(true)
    } catch {
      setError(strings.error_generic)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-gray-200/60 bg-white p-5 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={28} />
        <p className="font-bold text-navy">{strings.sent_title}</p>
        <p className="text-sm text-gray-500 mt-1">{strings.sent_body}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200/60 bg-white p-5 flex flex-col gap-3">
      <p className="font-bold text-navy mb-1">{strings.title}</p>

      <input
        type="text"
        value={website}
        onChange={e => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setContactMethod('email')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-colors ${
            contactMethod === 'email' ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <Mail size={13} /> {strings.by_email}
        </button>
        <button
          type="button"
          onClick={() => setContactMethod('phone')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-colors ${
            contactMethod === 'phone' ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <Phone size={13} /> {strings.by_phone}
        </button>
      </div>

      <input
        type="text"
        required
        placeholder={strings.name}
        value={name}
        onChange={e => setName(e.target.value)}
        className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
      />
      <input
        type="email"
        required
        placeholder={strings.email}
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
      />
      <input
        type="tel"
        required
        placeholder={strings.phone}
        value={phone}
        onChange={e => setPhone(e.target.value)}
        className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
      />

      <div>
        <label className="text-xs text-gray-500 mb-1 block">{strings.reason_label}</label>
        <select
          value={reason}
          onChange={e => setReason(e.target.value as Reason)}
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50 bg-white"
        >
          <option value="achat">{strings.reason_achat}</option>
          <option value="essai">{strings.reason_essai}</option>
          <option value="reprise">{strings.reason_reprise}</option>
        </select>
      </div>

      <textarea
        placeholder={`${strings.message} (${strings.message_optional})`}
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={3}
        className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="flex items-center justify-center gap-2 bg-orange-primary text-white font-bold text-sm py-3 rounded-xl hover:bg-orange-dark transition-colors disabled:opacity-60"
      >
        <Send size={14} /> {sending ? strings.sending : strings.send}
      </button>
    </form>
  )
}
