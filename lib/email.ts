import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Vendo <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://valencia-expat-market.vercel.app'

function emailHtml({
  toName, fromName, listingTitle, preview, conversationUrl,
}: {
  toName: string; fromName: string; listingTitle: string
  preview: string; conversationUrl: string
}): string {
  const initial = fromName.charAt(0).toUpperCase()
  const safePreview = preview.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeTitle   = listingTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeName    = fromName.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeToName  = toName.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nouveau message</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:#E8571A;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Vendo</p>
          <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">Petites annonces entre expatriés</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:36px 32px;">

          <p style="margin:0 0 8px;font-size:15px;color:#6B7280;">Bonjour <strong style="color:#1A1F36;">${safeToName}</strong>,</p>
          <p style="margin:0 0 28px;font-size:15px;color:#6B7280;">vous avez reçu un nouveau message.</p>

          <!-- Sender -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="vertical-align:middle;">
                <div style="width:42px;height:42px;border-radius:50%;background:#4F46E5;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:18px;text-align:center;line-height:42px;">
                  ${initial}
                </div>
              </td>
              <td style="vertical-align:middle;padding-left:12px;">
                <p style="margin:0;font-size:15px;font-weight:700;color:#1A1F36;">${safeName}</p>
                <p style="margin:2px 0 0;font-size:12px;color:#9CA3AF;">vous a écrit concernant :</p>
              </td>
            </tr>
          </table>

          <!-- Listing -->
          <div style="background:#FFF3EE;border-radius:12px;padding:14px 18px;margin-bottom:20px;border-left:3px solid #E8571A;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#1A1F36;">${safeTitle}</p>
          </div>

          <!-- Message preview -->
          <div style="background:#F9FAFB;border-radius:12px;padding:16px 18px;margin-bottom:32px;border:1px solid #F3F4F6;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${safePreview}</p>
          </div>

          <!-- CTA -->
          <div style="text-align:center;">
            <a href="${conversationUrl}" style="display:inline-block;background:#E8571A;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 36px;border-radius:12px;">
              Répondre au message →
            </a>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F9FAFB;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border-top:1px solid #F3F4F6;">
          <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.6;">
            Valencia Expat Market · Vous recevez cet email car quelqu'un vous a contacté via la plateforme.<br>
            <a href="${APP_URL}" style="color:#E8571A;text-decoration:none;">Accéder à Vendo</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendMessageNotification({
  to, toName, fromName, listingTitle, messageBody, conversationId,
}: {
  to: string; toName: string; fromName: string
  listingTitle: string; messageBody: string; conversationId: string
}) {
  if (!resend) return

  const preview = messageBody.length > 300 ? messageBody.slice(0, 300) + '…' : messageBody
  const conversationUrl = `${APP_URL}/messages/${conversationId}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${fromName} vous a envoyé un message sur Vendo`,
    html: emailHtml({ toName, fromName, listingTitle, preview, conversationUrl }),
  })
}
