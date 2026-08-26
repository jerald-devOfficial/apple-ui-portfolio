/**
 * Seeds an admin + regular user into a dedicated E2E MongoDB database.
 *
 * The E2E suite currently runs the public + auth-guard tiers only (see
 * `e2e/README.md`), so this script is not required for `yarn test:func`.
 * It exists so authenticated tiers can be enabled without re-deriving the
 * seed shape, and so local Mongo containers have realistic data.
 *
 * Required env:
 *   E2E_SEED_ENABLED=1
 *   MONGODB_URI            Test database — never production
 *   E2E_TEST_USER_EMAIL    Email used for both the admin and user records
 */
import mongoose from 'mongoose'
import process from 'node:process'
import dotenv from 'dotenv'

dotenv.config({ path: '.env', quiet: true })
dotenv.config({ path: '.env.local', override: true, quiet: true })

const PRODUCTION_HOST_ENV_KEYS = ['VERCEL_ENV', 'VERCEL', 'NETLIFY', 'RENDER']

const fail = (message: string): never => {
  console.error(`[seed:e2e] ${message}`)
  process.exit(1)
}

const assertSafeToSeed = (uri: string) => {
  if (process.env.E2E_SEED_ENABLED !== '1') {
    fail('Refusing to seed: set E2E_SEED_ENABLED=1 to opt in.')
  }

  if (process.env.NODE_ENV === 'production') {
    fail('Refusing to seed while NODE_ENV=production.')
  }

  const productionHost = PRODUCTION_HOST_ENV_KEYS.find(
    (key) => process.env[key] === 'production' || process.env[key] === '1'
  )

  if (productionHost) {
    fail(
      `Refusing to seed: production-like hosting env detected (${productionHost}).`
    )
  }

  const looksLikeTestDb = /(test|e2e|localhost|127\.0\.0\.1)/i.test(uri)

  if (!looksLikeTestDb) {
    fail(
      'Refusing to seed: MONGODB_URI does not look like a test database ' +
        '(expected "test"/"e2e" in the name, or a local host).'
    )
  }
}

const seed = async () => {
  const uri = process.env.MONGODB_URI

  if (!uri) fail('MONGODB_URI is not set.')

  assertSafeToSeed(uri!)

  const email = process.env.E2E_TEST_USER_EMAIL?.toLowerCase()

  if (!email) fail('E2E_TEST_USER_EMAIL is not set.')

  await mongoose.connect(uri!)

  const { Admin } = await import('../src/models/Admin')
  const { User } = await import('../src/models/User')

  await Admin.findOneAndUpdate(
    { email },
    {
      $set: {
        name: 'E2E Admin',
        email,
        authType: 'GOOGLE'
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: 'E2E User',
        email,
        authType: 'GOOGLE',
        isVerified: true
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  console.log(`[seed:e2e] Upserted admin + user for ${email}.`)
  await mongoose.disconnect()
}

seed().catch(async (error) => {
  console.error('[seed:e2e] Seeding failed:', error)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
