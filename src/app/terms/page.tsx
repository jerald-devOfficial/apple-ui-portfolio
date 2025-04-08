import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

export default function TermsOfService() {
  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        <div className="p-8 md:p-12 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">
            Terms of Service
          </h1>

          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                1. Agreement to Terms
              </h2>
              <p>
                By accessing and using https://jeraldbaroro.xyz (&ldquo;the
                Website&rdquo;), you agree to be bound by these Terms of
                Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                2. Description of Service
              </h2>
              <p>
                The Website provides a portfolio and diary management system
                with the following features:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Portfolio showcase</li>
                <li>Personal diary management</li>
                <li>Blog posts</li>
                <li>Web3 integration</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                3. User Responsibilities
              </h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Provide accurate information when using our services</li>
                <li>Maintain the security of your account credentials</li>
                <li>
                  Not use the service for any illegal or unauthorized purpose
                </li>
                <li>
                  Not attempt to access admin-only features without
                  authorization
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                4. Intellectual Property
              </h2>
              <p>
                All content on this Website, including but not limited to text,
                graphics, logos, and code, is the property of JB Portfolio and
                is protected by intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                5. Third-Party Services
              </h2>
              <p>
                We use Google OAuth for authentication. By using our service,
                you also agree to comply with Google&apos;s terms of service
                where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                6. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, we shall not be liable
                for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                7. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. We will
                notify users of any changes by updating the date at the bottom
                of this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                8. Governing Law
              </h2>
              <p>
                These terms shall be governed by and construed in accordance
                with the laws of the Philippines, without regard to its conflict
                of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-black dark:text-white">
                9. Contact
              </h2>
              <p>
                For any questions about these Terms of Service, please contact
                us at spaueofficial@gmail.com.
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
