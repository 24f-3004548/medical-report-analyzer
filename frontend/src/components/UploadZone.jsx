import { useCallback, useRef, useState } from "react";

export default function UploadZone({ file, onFileSelect, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const validateAndSet = useCallback(
    (selected) => {
      if (!selected) return;
      if (selected.type !== "application/pdf") {
        onFileSelect(null, "Please upload a PDF file.");
        return;
      }
      onFileSelect(selected, null);
    },
    [onFileSelect]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    validateAndSet(dropped);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed px-6 py-14 text-center cursor-pointer transition-colors duration-150 ${
          isDragging ? "border-forest bg-forest-light" : "border-border bg-white hover:border-forest/50"
        }`}
      >
        <svg className="h-9 w-9 text-forest" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <p className="text-body-lg font-medium text-ink">Drag and drop your report here</p>
          <p className="text-body-sm text-muted mt-1">or click to browse — PDF only</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </div>

      {file && !error && (
        <div className="mt-3 flex items-center gap-2 rounded-tag bg-forest-light px-3 py-2.5 text-body-sm text-forest">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate">{file.name}</span>
        </div>
      )}

      {error && (
        <p className="mt-3 text-body-sm text-critical" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
