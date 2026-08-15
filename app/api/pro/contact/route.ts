import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM_EMAIL ?? '1000Click <onboarding@resend.dev>'

const REASON_LABELS: Record<string, string> = {
  achat: "Projet d'achat",
  essai: "Essai de véhicule",
  reprise: "Reprise de véhicule",
}

export async function POST(req: NextRequest) {
  const { proId, name, email, phone, contactMethod, reason, message, website } = await req.json()

  // Honeypot — hidden field bots tend to fill in, humans never see it
  if (website) return NextResponse.json({ ok: true })

  const allowed = await checkRateLimit(`pro-contact:${getClientIp(req)}`, 5, 10 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard.' }, { status: 429 })

  if (!proId || !name || !email || !phone || !reason || !REASON_LABELS[reason]) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }
  if (typeof message === 'string' && message.length > 2000) {
    return NextResponse.json({ error: 'Message trop long' }, { status: 400 })
  }

  const pro = await prisma.professional.findUnique({
    where: { id: proId },
    select: { name: true, user: { select: { email: true } } },
  })
  if (!pro?.user?.email) {
    return NextResponse.json({ error: 'Professionnel introuvable' }, { status: 404 })
  }

  const safe = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  if (resend) {
    const result = await resend.emails.send({
      from: FROM,
      to: pro.user.email,
      replyTo: email,
      subject: `[1000Click] Nouvelle demande — ${REASON_LABELS[reason]}`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="background:#E8571A;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">1000Click · Contact Automobile</p>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">Nouvelle demande reçue sur votre profil</p>
        </td></tr>
        <tr><td style="background:#fff;padding:36px 32px;border-radius:0 0 16px 16px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#9CA3AF;width:120px;">Objet</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1A1F36;">${safe(REASON_LABELS[reason])}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#9CA3AF;">Nom</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1A1F36;">${safe(name)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#9CA3AF;">Email</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1A1F36;"><a href="mailto:${safe(email)}" style="color:#E8571A;text-decoration:none;">${safe(email)}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#9CA3AF;">Téléphone</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1A1F36;">${safe(phone)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#9CA3AF;">Contact préféré</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1A1F36;">${contactMethod === 'phone' ? 'Téléphone' : 'Email'}</td>
            </tr>
          </table>
          ${message ? `<div style="background:#F9FAFB;border-radius:12px;padding:20px;border:1px solid #F3F4F6;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${safe(message)}</p>
          </div>` : ''}
          <p style="margin:24px 0 0;font-size:12px;color:#9CA3AF;text-align:center;">
            Répondez directement à cet email pour contacter le demandeur.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })
    if (result.error) {
      console.error('[pro-contact] notification email failed:', result.error)
      return NextResponse.json({ error: "Échec de l'envoi" }, { status: 502 })
    }
  }

  return NextResponse.json({ ok: true })
}
