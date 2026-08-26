import MailChecker from 'mailchecker'
import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI is required')
  process.exit(1)
}

const dryRun = !process.argv.includes('--delete')

const URL_PATTERN = /(?:https?:\/\/|www\.)/i
const TEST_EMAIL_DOMAINS = new Set([
  'example.com',
  'example.org',
  'test.com',
  'localhost',
  'invalid.com'
])
const TEST_CONTENT_PATTERN =
  /\b(automated test|dev environment|dev setup|delivery test|test email|test subject|hello from dev|hello from automated|testing email|debug script|hello world)\b/i
const TEST_NAME_PATTERN =
  /^(test user|test email|dev setup test|jerald test|bot$|dev environment demo|cloud agent|test email from matt|demo user$)/i
const GENERIC_TEST_MESSAGE = /^(hello jerald|hello man|hi jerald|hey jerald)$/i
const LOW_EFFORT_SUBJECT = /^(great|test|hi|hello|hey|asdf|xxx)$/i
const LOW_EFFORT_MESSAGE = /^(i love you|test|hi+|hello+|asdf+|xxx+)$/i

const contactSchema = new mongoose.Schema(
  {},
  { strict: false, collection: 'contacts' }
)
const Contact =
  mongoose.models.ContactCleanup ||
  mongoose.model('ContactCleanup', contactSchema)

const buildContext = (mail) => {
  const email = (mail.email || '').trim().toLowerCase()
  const name = (mail.fullName || '').trim()
  const subject = (mail.subject || '').trim()
  const message = (mail.message || '').trim()

  return {
    email,
    name,
    subject,
    message,
    combined: `${name} ${subject} ${message}`.toLowerCase(),
    domain: email.split('@')[1]
  }
}

const CLASSIFICATION_RULES = [
  ({ email }) => !email?.includes('@') && 'invalid email format',
  ({ domain }) =>
    domain && TEST_EMAIL_DOMAINS.has(domain) && 'test/example email domain',
  ({ email }) =>
    email && !MailChecker.isValid(email) && 'disposable or blocklisted email',
  ({ name }) => TEST_NAME_PATTERN.test(name) && 'test name',
  ({ combined }) =>
    TEST_CONTENT_PATTERN.test(combined) && 'test/dev message content',
  ({ message }) =>
    message.length > 0 && message.length < 10 && 'message too short',
  ({ message, subject }) =>
    (URL_PATTERN.test(message) || URL_PATTERN.test(subject)) && 'contains link',
  ({ name }) =>
    /^(.)\1{4,}$/i.test(name.replace(/\s/g, '')) && 'spam name pattern',
  ({ subject, message }) =>
    LOW_EFFORT_SUBJECT.test(subject) &&
    LOW_EFFORT_MESSAGE.test(message) &&
    'low-effort spam',
  ({ message, subject }) =>
    (GENERIC_TEST_MESSAGE.test(message) ||
      GENERIC_TEST_MESSAGE.test(subject)) &&
    'generic test message',
  ({ email }) => email === 'ace_glac.jerald@yahoo.com' && 'self-test email',
  ({ subject, message }) =>
    /job lgwa do|bhai job lgwa do/i.test(`${subject} ${message}`) &&
    'low-quality spam message'
]

const classify = (mail) =>
  CLASSIFICATION_RULES.map((rule) => rule(buildContext(mail))).filter(Boolean)

await mongoose.connect(uri)

const all = await Contact.find({}).sort({ createdAt: -1 }).lean()
const toDelete = []
const toKeep = []

for (const mail of all) {
  const reasons = classify(mail)
  if (reasons.length > 0) {
    toDelete.push({ mail, reasons })
  } else {
    toKeep.push(mail)
  }
}

console.log(
  `\nTotal: ${all.length} | Delete: ${toDelete.length} | Keep: ${toKeep.length}\n`
)

if (toDelete.length) {
  console.log('--- TO DELETE ---')
  for (const { mail, reasons } of toDelete) {
    console.log(
      `- ${mail.fullName} <${mail.email}> | "${mail.subject}" | ${reasons.join(', ')} | ${mail._id}`
    )
  }
}

if (toKeep.length) {
  console.log('\n--- KEEPING ---')
  for (const mail of toKeep) {
    console.log(
      `- ${mail.fullName} <${mail.email}> | "${mail.subject}" | ${mail._id}`
    )
  }
}

if (!dryRun && toDelete.length) {
  const ids = toDelete.map(({ mail }) => mail._id)
  const result = await Contact.deleteMany({ _id: { $in: ids } })
  console.log(`\nDeleted ${result.deletedCount} contact(s).`)
} else if (dryRun) {
  console.log('\nDry run only. Pass --delete to remove entries.')
}

await mongoose.disconnect()
