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
  Plus,
  Trash2,
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

  const [conversations, setConversations] = useState([]);

  const [selectedConversationId, setSelectedConversationId] = useState("");

  const [conversationsLoading, setConversationsLoading] = useState(false);

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

    setConversations([]);

    setSelectedConversationId("");

    setError("");

  };


  // ============================================================
  // Conversation History
  // ============================================================

  useEffect(() => {

    if (!selectedPaperId) {
      return;
    }

    let cancelled = false;

    const loadConversations = async () => {

      try {

        setConversationsLoading(true);

        const response = await api.get("/api/conversations", {
          params: { paper_id: selectedPaperId },
        });

        const availableConversations =
          response.data.conversations || [];

        if (cancelled) {
          return;
        }

        setConversations(availableConversations);

        if (availableConversations.length === 0) {
          setSelectedConversationId("");
          setMessages([]);
          return;
        }

        const conversationId = String(
          availableConversations[0].id
        );

        setSelectedConversationId(conversationId);

        const detailResponse = await api.get(
          `/api/conversations/${conversationId}`
        );

        if (!cancelled) {
          setMessages(
            detailResponse.data.conversation?.messages || []
          );
        }

      } catch (err) {

        if (!cancelled) {
          setConversations([]);
          setSelectedConversationId("");
          setMessages([]);
          setError(
            err.response?.data?.detail ||
              "Unable to load conversation history."
          );
        }

      } finally {

        if (!cancelled) {
          setConversationsLoading(false);
        }

      }

    };

    loadConversations();

    return () => {
      cancelled = true;
    };

  }, [selectedPaperId]);


  const loadConversation = async (conversationId) => {

    try {

      setError("");

      const response = await api.get(
        `/api/conversations/${conversationId}`
      );

      setSelectedConversationId(String(conversationId));
      setMessages(response.data.conversation?.messages || []);

    } catch (err) {

      setError(
        err.response?.data?.detail ||
          "Unable to load this conversation."
      );

    }

  };


  const handleNewConversation = async () => {

    if (!selectedPaperId) {
      return;
    }

    try {

      setError("");

      const response = await api.post("/api/conversations", {
        paper_id: selectedPaperId,
      });

      const conversation = response.data.conversation;

      setConversations((previous) => [
        conversation,
        ...previous,
      ]);
      setSelectedConversationId(String(conversation.id));
      setMessages([]);

    } catch (err) {

      setError(
        err.response?.data?.detail ||
          "Unable to create a conversation."
      );

    }

  };


  const handleDeleteConversation = async () => {

    if (!selectedConversationId) {
      return;
    }

    try {

      setError("");

      await api.delete(
        `/api/conversations/${selectedConversationId}`
      );

      const remainingConversations = conversations.filter(
        (conversation) =>
          String(conversation.id) !== String(selectedConversationId)
      );

      setConversations(remainingConversations);

      if (remainingConversations.length > 0) {
        await loadConversation(remainingConversations[0].id);
      } else {
        setSelectedConversationId("");
        setMessages([]);
      }

    } catch (err) {

      setError(
        err.response?.data?.detail ||
          "Unable to delete this conversation."
      );

    }

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

    if (!selectedConversationId) {

      setError("Please start a conversation first.");

      return;

    }


    if (!trimmedQuestion) {

      setError(
        "Please enter a question."
      );

      return;

    }

    const userMessage = {
      id:
        Date.now() +
        "-user",

      role: "user",

      content: trimmedQuestion,
    };


    try {

      setAsking(true);

      setError("");


      // --------------------------------------------------------
      // Add user message immediately
      // --------------------------------------------------------

      setMessages((previous) => [
        ...previous,
        userMessage,
      ]);


      setQuestion("");


      // --------------------------------------------------------
      // Call backend
      // --------------------------------------------------------

      const response = await api.post(
        `/api/conversations/${selectedConversationId}/messages`,
        { content: trimmedQuestion }
      );


      // --------------------------------------------------------
      // Get AI response
      // --------------------------------------------------------

      if (response.data.success) {

        const answer = response.data.answer ||
          response.data.assistant_message?.content;


        const aiMessage = {

          id:
            response.data.assistant_message?.id ||
              Date.now() + "-assistant",

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
            userMessage.id
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
                  Conversation History
              ================================================= */}

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between gap-3">

                  <div className="flex items-center gap-2">

                    <MessageCircle
                      size={17}
                      className="text-indigo-600"
                    />

                    <h2 className="text-sm font-bold text-slate-900">
                      Conversations
                    </h2>

                  </div>

                  <button
                    type="button"
                    onClick={handleNewConversation}
                    disabled={conversationsLoading}
                    title="Start a new conversation"
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={14} />
                    <span>New</span>
                  </button>

                </div>

                <div className="mt-4 space-y-2">

                  {conversationsLoading ? (

                    <p className="text-xs text-slate-500">
                      Loading conversations...
                    </p>

                  ) : conversations.length === 0 ? (

                    <p className="text-xs leading-5 text-slate-500">
                      No saved conversations for this paper.
                    </p>

                  ) : (

                    conversations.map((conversation) => (

                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => loadConversation(conversation.id)}
                        className={`w-full rounded-lg border px-3 py-2.5 text-left text-xs transition ${
                          String(conversation.id) ===
                          String(selectedConversationId)
                            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                        }`}
                      >
                        <span className="block truncate font-semibold">
                          {conversation.title || "New conversation"}
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-400">
                          {conversation.messages?.length || 0} messages
                        </span>
                      </button>

                    ))

                  )}

                </div>

                {selectedConversationId && (

                  <button
                    type="button"
                    onClick={handleDeleteConversation}
                    title="Delete selected conversation"
                    className="mt-4 flex items-center gap-2 text-xs font-semibold text-red-600 transition hover:text-red-700"
                  >
                    <Trash2 size={14} />
                    Delete conversation
                  </button>

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