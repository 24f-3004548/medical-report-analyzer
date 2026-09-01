import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";

const STEPS = [
  { title: "Upload your report", description: "Add a lab report as a PDF. It stays private to you." },
  { title: "Results are extracted", description: "Veris reads each test, value, and reference range." },
  { title: "Medical context is retrieved", description: "Findings are checked against trusted medical sources." },
  { title: "Results are explained", description: "Everything is translated into plain, understandable language." },
];

export default function Home() {
  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden border-b border-border bg-forest text-white">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
          <div><Logo size="lg" variant="reversed" className="mb-8" /><p className="text-label font-semibold uppercase tracking-[0.22em] text-white/65">Medical clarity, without the noise</p><h1 className="mt-5 max-w-2xl font-display text-display text-white">Understand what your report is saying.</h1><p className="mt-5 max-w-xl text-body-lg text-white/75">Veris turns laboratory reports into clear, evidence-grounded explanations you can bring into your next appointment.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/register"><Button size="lg">Upload a report <span aria-hidden="true">→</span></Button></Link><Link to="/login"><Button size="lg" variant="secondary" className="border-white/30 bg-white text-forest hover:bg-forest-light">Sign in</Button></Link></div></div>
          <div className="relative hidden min-h-[330px] lg:block"><div className="absolute right-0 top-8 w-[88%] rounded-card border border-white/20 bg-white p-5 text-ink shadow-2xl"><div className="flex items-center justify-between border-b border-border pb-4"><div><p className="text-label uppercase tracking-wide text-muted">Latest report</p><p className="mt-1 font-body font-semibold">Complete blood count</p></div><span className="rounded-tag bg-forest-light px-2 py-1 text-label font-semibold uppercase text-forest">Complete</span></div><div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-btn bg-page p-3"><p className="text-label uppercase text-muted">Parameters</p><p className="mt-2 font-display text-h2">32</p></div><div className="rounded-btn bg-forest-light p-3"><p className="text-label uppercase text-forest">Normal</p><p className="mt-2 font-display text-h2">30</p></div><div className="rounded-btn bg-warning-bg p-3"><p className="text-label uppercase text-warning">Review</p><p className="mt-2 font-display text-h2">2</p></div></div><div className="mt-5 space-y-3"><div className="h-2 rounded-full bg-forest-light"><div className="h-2 w-[82%] rounded-full bg-forest" /></div><p className="text-body-sm text-muted">A simple view of what matters.</p></div></div><div className="absolute bottom-0 left-0 w-48 border border-white/20 bg-[#245a43] p-5"><p className="text-label uppercase tracking-wide text-white/60">Built around</p><p className="mt-3 font-display text-h2">Clarity<br />Trust<br />Care</p></div></div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-16">
          <p className="text-label font-semibold uppercase tracking-[0.18em] text-forest">A clearer workflow</p><h2 className="mt-2 font-display text-h1 text-ink">From PDF to understanding</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title}>
                <span className="text-body-sm font-medium text-forest">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-body font-semibold text-body-lg text-ink">{step.title}</h3>
                <p className="mt-1.5 text-body text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white">
        <div className="mx-auto grid max-w-content gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-10">
          <div><p className="text-label font-semibold uppercase tracking-[0.18em] text-forest">Private by default</p><h2 className="mt-2 font-display text-h1 text-ink">A calmer record of your health.</h2></div>
          <p className="self-end text-body-lg text-muted">Reports stay organized and explanations stay grounded, so the important part of your next appointment is easier to find.</p>
        </div>
      </section>
    </div>
  );
}
