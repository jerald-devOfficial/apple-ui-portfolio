import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

export default function PrivacyPolicy() {
  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        <div className="p-8 md:p-12 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">
            Privacy Policy
          </h1>

          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                1. Introduction
              </h2>
              <p>
                This Privacy Policy describes how JB Portfolio
                (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;)
                collects, uses, and protects your information when you use our
                website at https://jeraldbaroro.xyz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                2. Information We Collect
              </h2>
              <p>We collect the following types of information:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>
                  Authentication information when you sign in with Google (email
                  address and profile information)
                </li>
                <li>
                  Information you provide when creating and managing diary
                  entries
                </li>
                <li>Usage data and analytics to improve our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                3. How We Use Your Information
              </h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Authenticate you and provide access to our services</li>
                <li>Manage your diary entries and preferences</li>
                <li>Improve and optimize our website functionality</li>
                <li>Communicate with you about our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                4. Data Security
              </h2>
              <p>
                We implement appropriate security measures to protect your
                personal information. Your data is stored securely in our
                database, and we use industry-standard encryption for data
                transmission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                5. Third-Party Services
              </h2>
              <p>
                We use Google OAuth for authentication. When you sign in with
                Google, their privacy policy applies to the information you
                provide through their service. We recommend reviewing
                Google&apos;s privacy policy for more information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                6. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Access your personal information</li>
                <li>Request correction of your personal information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt-out of communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                7. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the effective date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                8. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at spaueofficial@gmail.com.
              </p>
            </section>

            <footer className="pt-8 text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </footer>
          </div>
        </div>
      </div>
    </main>
  )
}
