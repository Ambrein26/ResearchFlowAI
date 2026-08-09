import {
  X,
  Upload,
  FileText,
  LoaderCircle,
  CheckCircle,
} from "lucide-react";

import { useState } from "react";

import api from "../../services/api";


function UploadPaperModal({ onClose }) {

  const [file, setFile] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");


  // ============================================================
  // Select PDF
  // ============================================================

  const handleFileChange = (event) => {

    const selectedFile = event.target.files?.[0];

    setError("");

    if (!selectedFile) {
      return;
    }


    // Check file type

    if (selectedFile.type !== "application/pdf") {

      setError("Only PDF files are supported.");

      setFile(null);

      return;
    }


    // Check file size - 20 MB

    const maxSize = 20 * 1024 * 1024;

    if (selectedFile.size > maxSize) {

      setError("PDF size must be less than 20 MB.");

      setFile(null);

      return;
    }


    setFile(selectedFile);

  };


  // ============================================================
  // Upload + Analyze
  // ============================================================

  const handleUpload = async () => {

    if (!file) {

      setError("Please select a PDF file first.");

      return;

    }


    try {

      setUploading(true);

      setError("");


      // Create multipart form data

      const formData = new FormData();

      formData.append("file", file);


      // Send PDF to FastAPI

      const response = await api.post(
        "/api/papers/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );


      // Successful response

      if (response.data?.success) {

        // Close modal.
        // Papers.jsx will automatically refresh the list.

        onClose();

      } else {

        setError(
          response.data?.message ||
          "Paper analysis failed."
        );

      }

    } catch (err) {

      console.error("Paper upload failed:", err);

      setError(
        err.response?.data?.detail ||
        "Failed to upload and analyze the paper."
      );

    } finally {

      setUploading(false);

    }

  };


  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">


        {/* ====================================================
            Header
        ==================================================== */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              Upload Research Paper
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload a PDF to generate an AI-powered analysis.
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <X size={22} />

          </button>

        </div>


        {/* ====================================================
            Content
        ==================================================== */}

        <div className="space-y-5 px-6 py-6">


          {/* Upload Area */}

          {!file ? (

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">

                <Upload size={26} />

              </div>


              <h3 className="mt-4 text-base font-semibold text-slate-900">

                Choose a research paper

              </h3>


              <p className="mt-2 text-sm text-slate-500">

                Select a PDF file from your computer

              </p>


              <p className="mt-1 text-xs text-slate-400">

                Maximum file size: 20 MB

              </p>


              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

            </label>

          ) : (

            /* =================================================
               Selected File
            ================================================= */

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-center justify-between">

                <div className="flex min-w-0 items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">

                    <FileText size={25} />

                  </div>


                  <div className="min-w-0">

                    <p className="truncate font-semibold text-slate-900">

                      {file.name}

                    </p>


                    <p className="mt-1 text-sm text-slate-500">

                      {(file.size / (1024 * 1024)).toFixed(2)} MB

                    </p>

                  </div>

                </div>


                <CheckCircle
                  size={24}
                  className="shrink-0 text-green-600"
                />

              </div>


              {!uploading && (

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setError("");
                  }}
                  className="mt-4 text-sm font-medium text-red-600 transition hover:text-red-700"
                >

                  Remove file

                </button>

              )}

            </div>

          )}


          {/* =================================================
              Error
          ================================================= */}

          {error && (

            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              {error}

            </div>

          )}


          {/* =================================================
              Information
          ================================================= */}

          {file && !uploading && (

            <div className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">

              Your PDF will be processed using:

              <strong className="ml-1">
                PDF extraction → Gemini AI → PostgreSQL
              </strong>

            </div>

          )}


          {/* =================================================
              Uploading
          ================================================= */}

          {uploading && (

            <div className="rounded-lg bg-indigo-50 px-4 py-3">

              <div className="flex items-center gap-3 text-sm font-medium text-indigo-700">

                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />

                <span>
                  Uploading and analyzing your research paper...
                </span>

              </div>


              <p className="mt-2 pl-7 text-xs text-indigo-600">

                This may take a few moments while Gemini analyzes the paper.

              </p>

            </div>

          )}

        </div>


        {/* ====================================================
            Footer
        ==================================================== */}

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >

            Cancel

          </button>


          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {uploading ? (

              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />

                Analyzing...

              </>

            ) : (

              <>
                <Upload size={17} />

                Upload & Analyze

              </>

            )}

          </button>

        </div>

      </div>

    </div>

  );

}


export default UploadPaperModal;