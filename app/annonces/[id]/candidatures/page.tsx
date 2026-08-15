import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, FileText, Download, PawPrint, ShieldCheck } from 'lucide-react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ id: string }> }

const DOC_LABELS: Record<string, string> = {
  id_document: "Pièce d'identité",
  income_proof: 'Justificatif de revenus',
  tax_notice: "Avis d'imposition",
  address_proof: 'Justificatif de domicile',
  rib: 'RIB',
  guarantor_document: 'Pièce du garant / attestation bancaire',
}

const SITUATION_LABELS: Record<string, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  independant: 'Indépendant',
  etudiant: 'Étudiant',
  retraite: 'Retraité',
  sans_emploi: 'Sans emploi',
  autre: 'Autre',
}

export default async function ListingApplicationsPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const { id } = await params
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, title: true, userId: true },
  })
  if (!listing) notFound()

  const isOwner = listing.userId === session.user.id
  const isAdmin = session.user.role === 'ADMIN'
  if (!isOwner && !isAdmin) notFound()

  const applications = await prisma.rentalApplication.findMany({
    where: { listingId: id },
    include: { documents: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/mon-compte" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy mb-4">
          <ArrowLeft size={14} /> Retour à mon compte
        </Link>

        <h1 className="text-xl font-bold text-navy mb-1">Dossiers reçus</h1>
        <p className="text-sm text-gray-500 mb-6">
          Pour l&apos;annonce <Link href={`/annonces/${id}`} className="text-orange-primary hover:underline">{listing.title}</Link>
        </p>

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            Aucun dossier reçu pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-navy">{app.fullName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(app.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${app.type === 'LOCATION' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {app.type === 'LOCATION' ? 'Location' : 'Achat'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mb-3 text-sm">
                  <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-primary">
                    <Mail size={13} /> {app.email}
                  </a>
                  <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-primary">
                    <Phone size={13} /> {app.phone}
                  </a>
                </div>

                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600 mb-3">
                  {app.situation && <p><span className="text-gray-400">Situation :</span> {SITUATION_LABELS[app.situation] ?? app.situation}</p>}
                  {app.income && <p><span className="text-gray-400">{app.type === 'LOCATION' ? 'Revenus :' : 'Apport :'}</span> {app.income}</p>}
                  {app.desiredDuration && <p><span className="text-gray-400">Durée souhaitée :</span> {app.desiredDuration}</p>}
                  {app.hasGuarantor && (
                    <p className="flex items-center gap-1"><ShieldCheck size={13} className="text-emerald-500" /> Garant{app.guarantorInfo ? ` — ${app.guarantorInfo}` : ''}</p>
                  )}
                  {app.hasPets && (
                    <p className="flex items-center gap-1"><PawPrint size={13} className="text-amber-500" /> Animal{app.petsDetails ? ` — ${app.petsDetails}` : ''}</p>
                  )}
                </div>

                {app.message && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-3 whitespace-pre-line">{app.message}</p>
                )}

                {app.documents.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-50">
                    {app.documents.map(doc => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <FileText size={12} className="text-gray-400" />
                        {DOC_LABELS[doc.type] ?? doc.type}
                        <Download size={11} className="text-gray-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
