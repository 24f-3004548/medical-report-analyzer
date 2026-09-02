import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-page">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-border bg-forest text-white">
        <div className="mx-auto grid max-w-content items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">

          {/* -----------------------------------------------------
              HERO LEFT
          ----------------------------------------------------- */}
          <div>
            <p className="text-label font-semibold uppercase tracking-wider text-white/60">
              Medical clarity, without the noise
            </p>

            <h1 className="mt-5 max-w-xl font-display text-display text-white">
              Your lab report, explained clearly.
            </h1>

            <p className="mt-5 max-w-lg text-body-lg text-white/75">
              Upload a laboratory report and understand your results in
              plain language, with your original values and reference
              ranges kept in view.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link to="/register">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 font-body font-medium rounded-btn transition-colors duration-150 text-body-lg px-5 py-3 bg-white text-forest hover:bg-forest-light"
                >
                  Upload your report <span aria-hidden="true">→</span>
                </button>
              </Link>

              <a
                href="#how-it-works"
                className="text-body font-medium text-white/85 hover:text-white transition-colors duration-150 border-b border-white/30 hover:border-white/80 pb-0.5"
              >
                See how it works
              </a>
            </div>
          </div>


          {/* -----------------------------------------------------
              HERO RIGHT / PRODUCT PREVIEW
          ----------------------------------------------------- */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-full max-w-md overflow-hidden rounded-card bg-white text-ink shadow-2xl">

              {/* Mac-style window chrome */}
              <div
                className="border-b border-border bg-page"
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px" }}
              >
                <span
                  className="rounded-full"
                  style={{ backgroundColor: "#FF5F57", width: "12px", height: "12px", flexShrink: 0, display: "block" }}
                />
                <span
                  className="rounded-full"
                  style={{ backgroundColor: "#FEBC2E", width: "12px", height: "12px", flexShrink: 0, display: "block" }}
                />
                <span
                  className="rounded-full"
                  style={{ backgroundColor: "#28C840", width: "12px", height: "12px", flexShrink: 0, display: "block" }}
                />
                <span className="text-label text-muted" style={{ marginLeft: "6px" }}>cbc-report.pdf — Veris</span>
              </div>

              <div className="p-5">
                <p className="text-label uppercase tracking-wide text-muted">Lab report</p>
                <p className="mt-1 font-body font-semibold text-body-lg">Complete blood count</p>

                <div className="mt-4 divide-y divide-border border-y border-border">

                  <div className="py-3" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                    <div style={{ minWidth: 0 }}>
                      <p className="font-body font-medium text-body">Hemoglobin</p>
                      <p className="text-body-sm text-muted">Reference range 12–16 g/dL</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <span className="font-body font-medium text-body" style={{ whiteSpace: "nowrap" }}>13.2 g/dL</span>
                      <span className="rounded-full bg-forest-light text-forest text-body-sm font-semibold" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", flexShrink: 0 }}>✓</span>
                    </div>
                  </div>

                  <div className="py-3" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                    <div style={{ minWidth: 0 }}>
                      <p className="font-body font-medium text-body">WBC</p>
                      <p className="text-body-sm text-muted">Reference range 4,000–11,000 /µL</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <span className="font-body font-medium text-body" style={{ whiteSpace: "nowrap" }}>8,400 /µL</span>
                      <span className="rounded-full bg-forest-light text-forest text-body-sm font-semibold" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", flexShrink: 0 }}>✓</span>
                    </div>
                  </div>

                  <div className="py-3" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                    <div style={{ minWidth: 0 }}>
                      <p className="font-body font-medium text-body">Platelets</p>
                      <p className="text-body-sm text-muted">Reference range 150–450 k/µL</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <span className="font-body font-medium text-body" style={{ whiteSpace: "nowrap" }}>142 k/µL</span>
                      <span className="rounded-full bg-warning-bg text-warning text-body-sm font-semibold" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", flexShrink: 0 }}>!</span>
                    </div>
                  </div>

                </div>

                <div className="mt-4">
                  <p className="text-label uppercase tracking-wide text-muted">What this means</p>
                  <p className="mt-2 text-body-sm text-muted">
                    This result is slightly below the laboratory's
                    reported reference range.
                  </p>

                  <div
                    className="mt-3 border-t border-border pt-3"
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}
                  >
                    <p className="text-label uppercase tracking-wide text-muted">Medical context</p>
                    <span className="text-body-sm font-semibold text-forest" style={{ whiteSpace: "nowrap" }}>MedlinePlus →</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* =========================================================
          TRUST STRIP
      ========================================================= */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-content grid-cols-1 sm:grid-cols-3">

          <div className="border-b border-border px-6 py-6 text-center sm:border-b-0 sm:border-r">
            <p className="text-body-sm text-muted">
              <span className="font-semibold text-ink">Your report</span> — values and reference ranges stay visible
            </p>
          </div>

          <div className="border-b border-border px-6 py-6 text-center sm:border-b-0 sm:border-r">
            <p className="text-body-sm text-muted">
              <span className="font-semibold text-ink">Trusted sources</span> — checked against reliable references
            </p>
          </div>

          <div className="px-6 py-6 text-center">
            <p className="text-body-sm text-muted">
              <span className="font-semibold text-ink">Clear explanations</span> — complex results, plain language
            </p>
          </div>

        </div>
      </section>


      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section id="how-it-works" className="border-b border-border bg-white">
        <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-10">

          <p className="text-label font-semibold uppercase tracking-wider text-forest">How it works</p>
          <h2 className="mt-2 font-display text-h1 text-ink">From PDF to understanding</h2>

          <div className="relative mt-10 grid grid-cols-1 gap-20 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div className="pointer-events-none absolute left-0 right-0 top-4 hidden h-px bg-border lg:block" />

            <div className="relative">
              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-forest bg-page text-body-sm font-semibold text-forest">01</span>
              <h3 className="mt-4 font-body font-semibold text-body-lg text-ink">Upload</h3>
              <p className="mt-1.5 text-body text-muted">Add your laboratory report as a PDF.</p>
            </div>

            <div className="relative">
              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-forest bg-page text-body-sm font-semibold text-forest">02</span>
              <h3 className="mt-4 font-body font-semibold text-body-lg text-ink">Extract</h3>
              <p className="mt-1.5 text-body text-muted">Veris identifies each test, value and reference range.</p>
            </div>

            <div className="relative">
              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-forest bg-page text-body-sm font-semibold text-forest">03</span>
              <h3 className="mt-4 font-body font-semibold text-body-lg text-ink">Check</h3>
              <p className="mt-1.5 text-body text-muted">Findings are checked against trusted medical sources.</p>
            </div>

            <div className="relative">
              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-forest bg-page text-body-sm font-semibold text-forest">04</span>
              <h3 className="mt-4 font-body font-semibold text-body-lg text-ink">Explain</h3>
              <p className="mt-1.5 text-body text-muted">Everything is translated into plain, patient-friendly language.</p>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================
          WHAT MAKES VERIS DIFFERENT
      ========================================================= */}
      <section className="border-b border-border bg-page overflow-hidden">
      <div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 lg:px-10">

        <p className="text-label font-semibold uppercase tracking-wider text-forest">
          What makes Veris different
        </p>

        <h2 className="mt-2 font-display text-h1 text-ink">
          Designed around the report
        </h2>

        <div className="mt-10 grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-3">

          <div className="min-w-0 rounded-card border border-border bg-white px-10 py-12">
            <p className="text-body-sm font-semibold text-forest">
              01
            </p>

            <h3 className="mt-5 font-display text-h3 text-ink">
              Report-first
            </h3>

            <p className="mt-4 text-body text-muted">
              Your reported value and the laboratory's own reference
              range stay at the centre of the explanation.
            </p>
          </div>

          <div className="min-w-0 rounded-card border border-border bg-white px-10 py-12">
            <p className="text-body-sm font-semibold text-forest">
              02
            </p>

            <h3 className="mt-5 font-display text-h3 text-ink">
              Evidence-grounded
            </h3>

            <p className="mt-4 text-body text-muted">
              Relevant medical context is drawn from trusted,
              citable sources.
            </p>
          </div>

          <div className="min-w-0 rounded-card border border-border bg-white px-10 py-12">
            <p className="text-body-sm font-semibold text-forest">
              03
            </p>

            <h3 className="mt-5 font-display text-h3 text-ink">
              Not a diagnosis
            </h3>

            <p className="mt-4 text-body text-muted">
              Veris helps you understand your report. It doesn't
              diagnose or replace your doctor.
            </p>
          </div>

        </div>

      </div>
    </section>


      {/* =========================================================
          REPORT HISTORY
      ========================================================= */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-content gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-10">

          <div className="self-center">
            <p className="text-label font-semibold uppercase tracking-wider text-forest">Your reports</p>
            <h2 className="mt-2 font-display text-h1 text-ink">
              Your reports. Your history. One place.
            </h2>
            <p className="mt-4 max-w-md text-body text-muted">
              Come back to previous reports and their explanations
              whenever you need them.
            </p>
            <Link to="/register">
              <button
                type="button"
                className="mt-7 inline-flex items-center justify-center gap-2 font-body font-medium rounded-btn transition-colors duration-150 text-body-sm px-5 py-3 bg-forest text-white hover:bg-forest/90"
              >
                Upload a report →
              </button>
            </Link>
          </div>

          <div className="rounded-card border border-border bg-page px-6">
            <div className="flex items-center justify-between border-b border-border py-5">
              <div>
                <p className="font-body font-semibold text-body">Complete blood count</p>
                <p className="mt-1 text-body-sm text-muted">02 September 2026</p>
              </div>
              <span className="text-body-sm font-semibold text-forest">View →</span>
            </div>
            <div className="flex items-center justify-between border-b border-border py-5">
              <div>
                <p className="font-body font-semibold text-body">Liver function test</p>
                <p className="mt-1 text-body-sm text-muted">18 August 2026</p>
              </div>
              <span className="text-body-sm font-semibold text-forest">View →</span>
            </div>
            <div className="flex items-center justify-between py-5">
              <div>
                <p className="font-body font-semibold text-body">Thyroid profile</p>
                <p className="mt-1 text-body-sm text-muted">04 August 2026</p>
              </div>
              <span className="text-body-sm font-semibold text-forest">View →</span>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="bg-forest text-white">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-h1 text-white">
            Have a report you don't understand?
          </h2>
          <p className="mt-4 text-body-lg text-white/75">
            Upload it to Veris and get a clearer, evidence-grounded
            view of what it contains.
          </p>
          <Link to="/register">
            <button
              type="button"
              className="mt-8 inline-flex items-center justify-center gap-2 font-body font-medium rounded-btn transition-colors duration-150 text-body-lg px-5 py-3 bg-white text-forest hover:bg-forest-light"
            >
              Get started →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}