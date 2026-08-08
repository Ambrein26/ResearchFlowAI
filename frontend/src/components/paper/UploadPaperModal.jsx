import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
} from "lucide-react";

function UploadPaperModal({ onClose }) {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  const handleUpload = (event) => {
    event.preventDefault();

    if (!file) {
      return;
    }

    console.log("Selected PDF:", file);

    alert("PDF selected successfully. Backend integration will be added next.");

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">

      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Upload Research Paper
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload a PDF to start your AI analysis.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}
        <form
          onSubmit={handleUpload}
          className="p-6"
        >

          {!file ? (

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
              }`}
            >

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Upload size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Drop your PDF here
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                or click to browse from your computer
              </p>

              <p className="mt-3 text-xs text-slate-400">
                PDF files only
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

            </div>

          ) : (

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <FileText size={23} />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-semibold text-slate-900">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>

                </div>

                <CheckCircle
                  size={20}
                  className="text-green-600"
                />

              </div>

              <button
                type="button"
                onClick={() => setFile(null)}
                className="mt-4 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove file
              </button>

            </div>

          )}

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!file}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Upload & Analyze
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default UploadPaperModal;