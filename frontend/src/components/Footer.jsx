import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Logo size="sm" />
        <p className="text-body-sm text-muted">
          Veris explains laboratory reports. It doesn't diagnose conditions or replace your doctor.
        </p>
      </div>
    </footer>
  );
}
