import {
  ArrowLeft,
  Bot,
  FileText,
  LoaderCircle,
  AlertCircle,
  Send,
  Sparkles,
  User,
  BookOpen,
  MessageCircle,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../../services/api";


// ============================================================
// AI Research Assistant
// ============================================================

function Assistant() {

  // ============================================================
  // State
  // ============================================================

  const [papers, setPapers] = useState([]);

  const [selectedPaperId, setSelectedPaperId] = useState("");

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [asking, setAsking] = useState(false);

  const [error, setError] = useState("");


  // ============================================================
  // Fetch Papers
  // ============================================================

  useEffect(() => {

    const fetchPapers = async () => {

      try {

        setLoading(true);

        setError("");

        const response = await api.get("/api/papers");

        if (response.data.success) {

          const availablePapers =
            response.data.papers || [];

          setPapers(availablePapers);

          // Automatically select first paper
          if (availablePapers.length > 0) {

            setSelectedPaperId(
              String(availablePapers[0].id)
            );

          }

        } else {

          setPapers([]);

        }

      } catch (err) {

        console.error(
          "Failed to load papers:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load your research papers."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchPapers();

  }, []);


  // ============================================================
  // Selected Paper
  // ============================================================

  const selectedPaper = papers.find(
    (paper) =>
      String(paper.id) === String(selectedPaperId)
  );


  // ============================================================
  // Change Paper
  // ============================================================

  const handlePaperChange = (paperId) => {

    setSelectedPaperId(paperId);

    // Clear previous conversation when changing paper
    setMessages([]);

    setError("");

  };


  // ============================================================
  // Ask AI Assistant
  // ============================================================

  const handleAsk = async (event) => {

    event?.preventDefault();

    const trimmedQuestion =
      question.trim();


    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    if (!selectedPaperId) {

      setError(
        "Please select a research paper first."
      );

      return;

    }


    if (!trimmedQuestion) {

      setError(
        "Please enter a question."
      );

      return;

    }


    try {

      setAsking(true);

      setError("");


      // --------------------------------------------------------
      // Add user message immediately
      // --------------------------------------------------------

      const userMessage = {
        id:
          Date.now() +
          "-user",

        role: "user",

        content: trimmedQuestion,
      };


      setMessages((previous) => [
        ...previous,
        userMessage,
      ]);


      setQuestion("");


      // --------------------------------------------------------
      // Call backend
      // --------------------------------------------------------

     const response = await api.post(
     "/api/assistant/ask",
     {
      paper_id: selectedPaperId,
      question: trimmedQuestion,

      conversation_history: [
        ...messages,
        userMessage,
       ].map((message) => ({
         role: message.role,
         content: message.content,
      })),
     }
    );


      // --------------------------------------------------------
      // Get AI response
      // --------------------------------------------------------

      if (response.data.success) {

        const answer =
          response.data.answer ||
          response.data.response ||
          response.data.result ||
          response.data.message;


        const aiMessage = {

          id:
            Date.now() +
            "-assistant",

          role: "assistant",

          content:
            answer ||
            "The AI assistant did not return an answer.",
        };


        setMessages((previous) => [
          ...previous,
          aiMessage,
        ]);

      } else {

        setError(
          response.data.message ||
            "Unable to generate an answer."
        );

      }

    } catch (err) {

      console.error(
        "AI assistant error:",
        err
      );


      // --------------------------------------------------------
      // Remove user message if request failed
      // --------------------------------------------------------

      setMessages((previous) =>
        previous.filter(
          (message) =>
            message.id !==
            Date.now() + "-user"
        )
      );


      setError(
        err.response?.data?.detail ||
          "Unable to get a response from the AI assistant."
      );

    } finally {

      setAsking(false);

    }

  };


  // ============================================================
  // Suggested Questions
  // ============================================================

  const suggestedQuestions = [

    "What is the main objective of this paper?",

    "Explain the methodology used in this paper.",

    "What dataset was used and how was it prepared?",

    "What are the key findings of this paper?",

    "What are the limitations of this research?",

    "What future work is suggested by the authors?",

  ];


  // ============================================================
  // Use Suggested Question
  // ============================================================

  const handleSuggestedQuestion = (
    suggestedQuestion
  ) => {

    setQuestion(
      suggestedQuestion
    );

    setError("");

  };


  // ============================================================
  // Loading
  // ============================================================

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="flex flex-col items-center gap-4">

          <LoaderCircle
            size={40}
            className="animate-spin text-indigo-600"
          />

          <p className="text-sm font-medium text-slate-600">
            Loading research papers...
          </p>

        </div>

      </div>

    );

  }


  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="min-h-screen bg-slate-50">


      {/* ======================================================
          Header
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="flex items-center gap-4 px-8 py-5">

          <Link
            to="/papers"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >

            <ArrowLeft size={20} />

          </Link>


          <div>

            <div className="flex items-center gap-2">

              <Bot
                size={18}
                className="text-indigo-600"
              />

              <span className="text-sm font-medium text-slate-500">
                AI Research Assistant
              </span>

            </div>


            <h1 className="mt-1 text-xl font-bold text-slate-900">
              Ask Your Research Assistant
            </h1>

          </div>

        </div>

      </header>


      {/* ======================================================
          Main
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-8 py-8">


        {/* ====================================================
            Error
        ==================================================== */}

        {error && (

          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>
              {error}
            </p>

          </div>

        )}


        {/* ====================================================
            No Papers
        ==================================================== */}

        {papers.length === 0 ? (

          <section className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <FileText
              size={42}
              className="mx-auto text-slate-400"
            />


            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No research papers available
            </h2>


            <p className="mt-2 text-sm text-slate-500">
              Upload and analyze at least one research
              paper before using the AI Research Assistant.
            </p>


            <Link
              to="/papers"
              className="mt-5 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Go to My Papers
            </Link>

          </section>

        ) : (

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">


            {/* ==================================================
                Left Sidebar
            ================================================== */}

            <aside className="space-y-6">


              {/* =================================================
                  Paper Selection
              ================================================= */}

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

                    <BookOpen size={19} />

                  </div>


                  <div>

                    <h2 className="text-sm font-bold text-slate-900">
                      Research Paper
                    </h2>

                    <p className="text-xs text-slate-500">
                      Select context
                    </p>

                  </div>

                </div>


                {/* Paper Dropdown */}

                <select
                  value={selectedPaperId}
                  onChange={(event) =>
                    handlePaperChange(
                      event.target.value
                    )
                  }
                  className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >

                  {papers.map((paper) => (

                    <option
                      key={paper.id}
                      value={paper.id}
                    >

                      {paper.title ||
                        paper.filename ||
                        "Untitled Paper"}

                    </option>

                  ))}

                </select>


                {/* Selected Paper Information */}

                {selectedPaper && (

                  <div className="mt-5 rounded-lg bg-slate-50 p-4">

                    <div className="flex items-start gap-3">

                      <FileText
                        size={18}
                        className="mt-0.5 shrink-0 text-indigo-600"
                      />


                      <div className="min-w-0">

                        <p className="line-clamp-3 text-sm font-semibold text-slate-900">

                          {selectedPaper.title ||
                            selectedPaper.filename ||
                            "Untitled Research Paper"}

                        </p>


                        <p className="mt-2 text-xs leading-5 text-slate-500">

                          {Array.isArray(
                            selectedPaper.authors
                          )
                            ? selectedPaper.authors.join(
                                ", "
                              )
                            : selectedPaper.authors ||
                              "Unknown authors"}

                        </p>


                        {selectedPaper.page_count && (

                          <p className="mt-2 text-xs text-slate-500">

                            {selectedPaper.page_count} pages

                          </p>

                        )}

                      </div>

                    </div>

                  </div>

                )}

              </section>


              {/* =================================================
                  Suggested Questions
              ================================================= */}

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-2">

                  <Sparkles
                    size={17}
                    className="text-indigo-600"
                  />

                  <h2 className="text-sm font-bold text-slate-900">
                    Suggested Questions
                  </h2>

                </div>


                <div className="mt-4 space-y-2">

                  {suggestedQuestions.map(
                    (suggestedQuestion, index) => (

                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          handleSuggestedQuestion(
                            suggestedQuestion
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs leading-5 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >

                        {suggestedQuestion}

                      </button>

                    )
                  )}

                </div>

              </section>

            </aside>


            {/* ==================================================
                Right Chat Area
            ================================================== */}

            <section className="flex min-h-[700px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">


              {/* =================================================
                  Chat Header
              ================================================= */}

              <div className="border-b border-slate-200 bg-indigo-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white">

                    <Bot size={22} />

                  </div>


                  <div>

                    <h2 className="font-bold text-slate-900">
                      AI Research Assistant
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">

                      Ask questions based on the selected
                      research paper.

                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  Chat Messages
              ================================================= */}

              <div className="flex-1 space-y-5 overflow-y-auto p-6">


                {/* Empty State */}

                {messages.length === 0 && (

                  <div className="flex min-h-[480px] flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">

                      <MessageCircle
                        size={30}
                      />

                    </div>


                    <h3 className="mt-5 text-lg font-bold text-slate-900">

                      Ask anything about your paper

                    </h3>


                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">

                      The AI assistant uses the selected
                      paper's stored analysis to answer
                      contextual research questions.

                    </p>

                  </div>

                )}


                {/* Messages */}

                {messages.map((message) => (

                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    {/* AI Icon */}

                    {message.role ===
                      "assistant" && (

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">

                        <Bot size={17} />

                      </div>

                    )}


                    {/* Message */}

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "rounded-br-md bg-indigo-600 text-white"
                          : "rounded-bl-md bg-slate-100 text-slate-700"
                      }`}
                    >

                      <p
                        className={`whitespace-pre-wrap text-sm leading-7 ${
                          message.role ===
                          "user"
                            ? "text-white"
                            : "text-slate-700"
                        }`}
                      >

                        {message.content}

                      </p>

                    </div>


                    {/* User Icon */}

                    {message.role ===
                      "user" && (

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">

                        <User size={17} />

                      </div>

                    )}

                  </div>

                ))}


                {/* Loading Message */}

                {asking && (

                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">

                      <Bot size={17} />

                    </div>


                    <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3">

                      <div className="flex items-center gap-2">

                        <LoaderCircle
                          size={16}
                          className="animate-spin text-indigo-600"
                        />

                        <span className="text-sm text-slate-500">

                          Thinking...

                        </span>

                      </div>

                    </div>

                  </div>

                )}

              </div>


              {/* =================================================
                  Input Area
              ================================================= */}

              <div className="border-t border-slate-200 bg-white p-5">

                <form
                  onSubmit={handleAsk}
                  className="flex items-end gap-3"
                >

                  <div className="flex-1">

                    <textarea
                      value={question}
                      onChange={(event) =>
                        setQuestion(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {

                        if (
                          event.key ===
                            "Enter" &&
                          !event.shiftKey
                        ) {

                          event.preventDefault();

                          handleAsk(event);

                        }

                      }}
                      rows={3}
                      placeholder="Ask a question about the selected paper..."
                      disabled={asking}
                      className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    />

                    <p className="mt-2 text-xs text-slate-400">

                      Press Enter to send · Shift + Enter
                      for a new line

                    </p>

                  </div>


                  <button
                    type="submit"
                    disabled={
                      asking ||
                      !question.trim() ||
                      !selectedPaperId
                    }
                    className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {asking ? (

                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />

                    ) : (

                      <Send size={18} />

                    )}

                    <span className="hidden sm:inline">
                      Ask
                    </span>

                  </button>

                </form>

              </div>

            </section>

          </div>

        )}

      </main>

    </div>

  );

}


export default Assistant;