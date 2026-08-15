'use client'
import { useState, FormEvent } from 'react'
import { X, Upload, Send, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

type ApplicationType = 'LOCATION' | 'ACHAT'

const DOC_FIELDS = [
  { key: 'id_document', labelKey: 'app_doc_id' },
  { key: 'income_proof', labelKey: 'app_doc_income' },
  { key: 'tax_notice', labelKey: 'app_doc_tax' },
  { key: 'address_proof', labelKey: 'app_doc_address' },
  { key: 'rib', labelKey: 'app_doc_rib' },
  { key: 'guarantor_document', labelKey: 'app_doc_guarantor' },
] as const

export default function RentalApplicationModal({
  listingId,
  defaultType,
  defaultName,
  defaultEmail,
  onClose,
}: {
  listingId: string
  defaultType: ApplicationType
  defaultName?: string
  defaultEmail?: string
  onClose: () => void
}) {
  const t = useTranslations('ListingDetail')
  const [type, setType] = useState<ApplicationType>(defaultType)
  const [fullName, setFullName] = useState(defaultName ?? '')
  const [email, setEmail] = useState(defaultEmail ?? '')
  const [phone, setPhone] = useState('')
  const [situation, setSituation] = useState('')
  const [income, setIncome] = useState('')
  const [hasGuarantor, setHasGuarantor] = useState(false)
  const [guarantorInfo, setGuarantorInfo] = useState('')
  const [hasPets, setHasPets] = useState(false)
  const [petsDetails, setPetsDetails] = useState('')
  const [desiredDuration, setDesiredDuration] = useState('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (key: string, f: File | null) => setFiles(prev => ({ ...prev, [key]: f }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      const fd = new FormData()
      fd.set('type', type)
      fd.set('fullName', fullName)
      fd.set('email', email)
      fd.set('phone', phone)
      if (situation) fd.set('situation', situation)
      if (income) fd.set('income', income)
      fd.set('hasGuarantor', String(hasGuarantor))
      if (guarantorInfo) fd.set('guarantorInfo', guarantorInfo)
      fd.set('hasPets', String(hasPets))
      if (petsDetails) fd.set('petsDetails', petsDetails)
      if (type === 'LOCATION' && desiredDuration) fd.set('desiredDuration', desiredDuration)
      if (message) fd.set('message', message)
      for (const { key } of DOC_FIELDS) {
        const f = files[key]
        if (f) fd.set(`doc_${key}`, f)
      }

      const res = await fetch(`/api/listings/${listingId}/application`, { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? t('app_error_generic'))
        return
      }
      setSent(true)
    } catch {
      setError(t('app_error_generic'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="app-modal-title" className="font-bold text-navy text-lg">{t('app_modal_title')}</h3>
          <button onClick={onClose} aria-label="Fermer" className="text-gray-400 hover:text-navy transition-colors">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-6" role="status" aria-live="polite">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={32} />
            <p className="font-bold text-navy mb-1">{t('app_sent_title')}</p>
            <p className="text-sm text-gray-500 mb-4">{t('app_sent_body')}</p>
            <button
              onClick={onClose}
              className="w-full bg-orange-primary text-white font-bold text-sm py-3 rounded-xl hover:bg-orange-dark transition-colors"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('LOCATION')}
                className={`flex-1 text-sm font-semibold py-2.5 rounded-lg border transition-colors ${type === 'LOCATION' ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {t('app_type_location')}
              </button>
              <button
                type="button"
                onClick={() => setType('ACHAT')}
                className={`flex-1 text-sm font-semibold py-2.5 rounded-lg border transition-colors ${type === 'ACHAT' ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {t('app_type_achat')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder={t('app_full_name')}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="col-span-2 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
              />
              <input
                required
                type="email"
                placeholder={t('app_email')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
              />
              <input
                required
                type="tel"
                placeholder={t('app_phone')}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
              />
            </div>

            <select
              value={situation}
              onChange={e => setSituation(e.target.value)}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
            >
              <option value="">{t('app_situation_label')}</option>
              <option value="cdi">{t('app_situation_cdi')}</option>
              <option value="cdd">{t('app_situation_cdd')}</option>
              <option value="independant">{t('app_situation_independant')}</option>
              <option value="etudiant">{t('app_situation_etudiant')}</option>
              <option value="retraite">{t('app_situation_retraite')}</option>
              <option value="sans_emploi">{t('app_situation_sans_emploi')}</option>
              <option value="autre">{t('app_situation_autre')}</option>
            </select>

            <input
              placeholder={type === 'LOCATION' ? t('app_income_location') : t('app_income_achat')}
              value={income}
              onChange={e => setIncome(e.target.value)}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
            />

            {type === 'LOCATION' && (
              <input
                placeholder={t('app_duration')}
                value={desiredDuration}
                onChange={e => setDesiredDuration(e.target.value)}
                className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
              />
            )}

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={hasGuarantor} onChange={e => setHasGuarantor(e.target.checked)} className="rounded" />
              {t('app_has_guarantor')}
            </label>
            {hasGuarantor && (
              <textarea
                placeholder={t('app_guarantor_info')}
                value={guarantorInfo}
                onChange={e => setGuarantorInfo(e.target.value)}
                rows={2}
                className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
              />
            )}

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={hasPets} onChange={e => setHasPets(e.target.checked)} className="rounded" />
              {t('app_has_pets')}
            </label>
            {hasPets && (
              <input
                placeholder={t('app_pets_details')}
                value={petsDetails}
                onChange={e => setPetsDetails(e.target.value)}
                className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
              />
            )}

            <textarea
              placeholder={`${t('app_message')} (${t('app_message_optional')})`}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={2}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-primary/50"
            />

            <div className="border-t border-gray-100 pt-3 mt-1">
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                <Upload size={13} /> {t('app_documents_title')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DOC_FIELDS.map(({ key, labelKey }) => (
                  <label key={key} className="flex flex-col gap-1 text-xs text-gray-500">
                    {t(labelKey)}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={e => handleFile(key, e.target.files?.[0] ?? null)}
                      className="text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:bg-gray-100 file:text-xs file:font-medium file:text-gray-600 hover:file:bg-gray-200"
                    />
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={sending}
              className="flex items-center justify-center gap-2 bg-orange-primary text-white font-bold text-sm py-3 rounded-xl hover:bg-orange-dark transition-colors disabled:opacity-60 mt-1"
            >
              <Send size={14} /> {sending ? t('sending') : t('app_send')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
