import Link from "next/link"

import { Header } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/site-footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#05091a] text-white">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-8 pt-32 pb-20 sm:px-12 w-full">
        <nav className="flex items-center gap-2 text-xs text-white/40 mb-6">
          <Link href="/"
            className="hover:text-white/70 transition-colors">
            Home
          </Link>
          <span>
            /
          </span>
          <span className="text-white/70">
            Privacy Policy
          </span>
        </nav>
        <h1 className="text-3xl font-bold mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-sm leading-relaxed text-white/60">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              1. Information We Collect
            </h2>
            <p>
              When you join a race, we collect only the nickname you provide. Admin users authenticate
              with an email and password. We do not collect personal data from race participants beyond
              what is needed to run the game.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              2. How We Use Your Information
            </h2>
            <p>
              Nicknames are used solely to identify participants during a race and display progress on
              the leaderboard. Admin credentials are used for authentication to manage races.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              3. Data Storage
            </h2>
            <p>
              Race and participant data is stored in a secure PostgreSQL database. Session data is
              managed through secure HTTP-only cookies. We do not sell or share your data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              4. Cookies
            </h2>
            <p>
              We use essential cookies for admin session management. No tracking or advertising
              cookies are used on this site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              5. Contact
            </h2>
            <p>
              If you have any questions about this privacy policy, please reach out to the site administrator.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
