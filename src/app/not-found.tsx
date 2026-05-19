import Link from "next/link"

import { Header } from "@/components/layout/header"
import { SiteFooter } from "@/components/layout/site-footer"

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* 404 Display */}
          <div className="space-y-4">
            <div className="inline-block">
              <h1
                className="text-8xl md:text-9xl font-mono font-bold tracking-tighter"
                style={{
                  textShadow: `0 0 20px var(--green), 0 0 40px var(--green)`,
                  color: "var(--green)",
                }}
              >
                404
              </h1>
            </div>
            <div className="h-1 w-24 bg-linear-to-r from-transparent via-green-500 to-transparent mx-auto" />
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              PAGE NOT FOUND
            </h2>
            <p className="text-base md:text-lg text-gray-400 font-mono">
              Looks like you&apos;ve hit a dead end on the track.
              <br />
              The page you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/"
              className="chamfer h-12 px-8 inline-flex items-center justify-center font-mono
               uppercase tracking-[0.12em] text-sm font-semibold text-(--fg) shadow-[inset_0_0_0_1px_var(--green)]
               hover:text-neon-green hover:shadow-[inset_0_0_0_2px_var(--green),0_0_20px_var(--green)]
               transition-all duration-200"
              style={{
                color: "var(--green)",
                boxShadow:
                  "inset 0 0 0 1px var(--green), 0 0 10px rgba(34, 197, 94, 0.3)",
              }}
            >
              Back to Home
            </Link>
          </div>

          {/* Decorative Grid */}
          <div className="pt-12">
            <div
              className="inline-flex items-center justify-center gap-2 text-xs font-mono text-gray-500"
              style={{
                textShadow: "0 0 10px rgba(34, 197, 94, 0.2)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500" />
              ERROR: ROUTE_NOT_FOUND
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
