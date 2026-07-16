import { Resend } from 'resend'

type ContactNotificationPayload = {
  fullName: string
  email: string
  subject: string
  message: string
}

const getContactRecipient = () =>
  process.env.CONTACT_TO || process.env.NEXT_PUBLIC_ADMIN_EMAIL

const getContactFrom = () => process.env.CONTACT_FROM

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const buildContactEmailHtml = ({
  fullName,
  email,
  subject,
  message
}: ContactNotificationPayload) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const escapedMessage = escapeHtml(message).replaceAll('\n', '<br />')

  return `
    <h2>New portfolio contact message</h2>
    <p><strong>From:</strong> ${escapeHtml(fullName)} &lt;${escapeHtml(email)}&gt;</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Received:</strong> ${new Date().toUTCString()}</p>
    <hr />
    <p>${escapedMessage}</p>
    <hr />
    ${appUrl ? `<p><a href="${escapeHtml(appUrl)}/mails">View in portfolio inbox</a></p>` : ''}
  `
}

export const sendContactNotification = async (
  payload: ContactNotificationPayload
) => {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn(
      'contact: RESEND_API_KEY is not set — skipping email notification'
    )
    return { data: null, error: null, skipped: true as const }
  }

  const from = getContactFrom()
  const to = getContactRecipient()

  if (!from || !to) {
    console.warn(
      'contact: CONTACT_FROM or CONTACT_TO/NEXT_PUBLIC_ADMIN_EMAIL is not set — skipping email notification'
    )
    return { data: null, error: null, skipped: true as const }
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: payload.email,
    subject: `[Portfolio] ${payload.subject}`,
    html: buildContactEmailHtml(payload)
  })

  if (error) {
    console.error('contact: failed to send email notification', error)
  }

  return { data, error, skipped: false as const }
}
