import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";

const STEPS = [
  { title: "Upload your report", description: "Add a lab report as a PDF. It stays private to you." },
  { title: "Results are extracted", description: "Veris reads each test, value, and reference range." },
  { title: "Medical context is retrieved", description: "Findings are checked against trusted medical sources." },
  { title: "Results are explained", description: "Everything is translated into plain, understandable language." },
];

const FEATURES = [
  {
    title: "Laboratory result extraction",
    description: "Every test on your report is pulled out accurately, with its value and reference range intact.",
  },
  {
    title: "Patient-friendly explanations",
    description: "Clinical terms are translated into language you can actually use in conversation.",
  },
  {
    title: "Medical context",
    description: "Explanations are grounded in real medical sources, so you know where the information comes from.",
  },
  {
    title: "Report history",
    description: "Every report you upload is saved, so you can look back and track how things change.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <div className="max-w-2xl">
          <Logo size="lg" className="mb-6" />
          <h1 className="font-display text-display text-ink">
            Understand your lab report in plain language.
          </h1>
          <p className="mt-4 text-body-lg text-muted max-w-xl">
            Veris reads your laboratory report and explains each result clearly — what it measures, whether it's
            within range, and what it might mean — so you can talk to your doctor with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register">
              <Button size="lg">Upload your report</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-white">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-16">
          <h2 className="font-display text-h1 text-ink">How Veris works</h2>
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

      {/* Features */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-16">
          <h2 className="font-display text-h1 text-ink">What you get with every report</h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-card border border-border bg-white p-6">
                <h3 className="font-body font-semibold text-body-lg text-ink">{feature.title}</h3>
                <p className="mt-1.5 text-body text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="border-t border-border bg-white">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-16">
          <div className="rounded-card bg-forest-light p-8 sm:p-10 max-w-2xl">
            <h2 className="font-display text-h2 text-ink">Your data stays yours</h2>
            <p className="mt-3 text-body-lg text-ink/80">
              Reports are private by default. Veris doesn't sell your data or share it beyond what's needed to
              generate your results.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer + closing CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-16 text-center">
          <h2 className="font-display text-h1 text-ink">Ready to understand your results?</h2>
          <p className="mt-3 text-body text-muted max-w-lg mx-auto">
            Veris explains what your report says — it doesn't diagnose conditions, prescribe treatment, or replace
            your doctor.
          </p>
          <div className="mt-8">
            <Link to="/register">
              <Button size="lg">Get started</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
