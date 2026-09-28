import fitz


def extract_text_from_pdf(file_bytes: bytes):
    """
    Extract text from a PDF using PyMuPDF.
    Removes invalid NUL characters from extracted text.
    """

    document = fitz.open(
        stream=file_bytes,
        filetype="pdf"
    )

    pages = []

    for page_number, page in enumerate(document, start=1):
        text = page.get_text("text")

        # Remove NUL characters that can cause PostgreSQL/Gemini errors
        text = text.replace("\x00", "").strip()

        pages.append({
            "page_number": page_number,
            "text": text
        })

    full_text = "\n\n".join(
        page["text"]
        for page in pages
        if page["text"]
    )

    # Final safety cleanup
    full_text = full_text.replace("\x00", "").strip()

    result = {
        "page_count": len(document),
        "full_text": full_text,
        "pages": pages
    }

    document.close()

    return result