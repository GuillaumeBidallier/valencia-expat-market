import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM_EMAIL ?? '1000Click <onboarding@resend.dev>'
const CONTACT_EMAIL = process.env.ADMIN_EMAIL ?? 'contact@vendo.es'

export async function POST(req: NextRequest) {
  const { name, email, subject, message, website } = await req.json()

  // Honeypot — hidden field bots tend to fill in, humans never see it
  if (website) return NextResponse.json({ ok: true })

  const allowed = await checkRateLimit(`contact:${getClientIp(req)}`, 5, 10 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: 'Trop de requêtes, réessayez plus tard.' }, { status: 429 })

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'Message trop long' }, { status: 400 })
  }

  const safeName    = name.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeEmail   = email.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeSubject = subject.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  if (resend) {
    await resend.emails.send({
      from: FROM,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[Contact 1000Click] ${subject}`,
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="background:#E8571A;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">1000Click · Contact</p>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">Nouveau message reçu via le formulaire</p>
        </td></tr>
        <tr><td style="background:#fff;padding:36px 32px;border-radius:0 0 16px 16px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#9CA3AF;width:100px;">Nom</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1A1F36;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#9CA3AF;">Email</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1A1F36;"><a href="mailto:${safeEmail}" style="color:#E8571A;text-decoration:none;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#9CA3AF;">Sujet</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1A1F36;">${safeSubject}</td>
            </tr>
          </table>
          <div style="background:#F9FAFB;border-radius:12px;padding:20px;border:1px solid #F3F4F6;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${safeMessage}</p>
          </div>
          <p style="margin:24px 0 0;font-size:12px;color:#9CA3AF;text-align:center;">
            Répondez directement à cet email pour contacter l'expéditeur.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })

    // Auto-reply to sender
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Nous avons bien reçu votre message — 1000Click',
      html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="background:#1A1F36;border-radius:16px 16px 0 0;padding:32px;text-align:center;">
          <p style="margin:0;font-size:26px;font-weight:900;color:#fff;">1000Click</p>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">Petites annonces entre expatriés</p>
        </td></tr>
        <tr><td style="background:#fff;padding:40px 36px;border-radius:0 0 16px 16px;">
          <p style="margin:0 0 16px;font-size:22px;font-weight:900;color:#1A1F36;">Merci, ${safeName} !</p>
          <p style="margin:0 0 20px;font-size:15px;color:#6B7280;line-height:1.7;">
            Nous avons bien reçu votre message concernant <strong style="color:#1A1F36;">"${safeSubject}"</strong> et nous vous répondrons dans les plus brefs délais (généralement sous 24-48h).
          </p>
          <div style="background:#FFF3EE;border-radius:12px;padding:16px 20px;margin-bottom:28px;border-left:3px solid #E8571A;">
            <p style="margin:0;font-size:13px;color:#6B7280;">📧 Une copie de votre message a été enregistrée. Si votre demande est urgente, vous pouvez également nous écrire directement à <a href="mailto:contact@vendo.es" style="color:#E8571A;text-decoration:none;">contact@vendo.es</a>.</p>
          </div>
          <p style="margin:0 0 32px;font-size:14px;color:#6B7280;line-height:1.7;">
            En attendant, n'hésitez pas à explorer les annonces de notre communauté ou à consulter notre blog pour des conseils pratiques sur la vie en Espagne.
          </p>
          <div style="text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://valencia-expat-market.vercel.app'}" style="display:inline-block;background:#E8571A;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:12px;">
              Retour sur 1000Click →
            </a>
          </div>
          <p style="margin:36px 0 0;font-size:12px;color:#9CA3AF;text-align:center;">
            1000Click · contact@vendo.es
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })
  }

  return NextResponse.json({ ok: true })
}
