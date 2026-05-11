"use client";

import type {
  ChangeEvent,
  DragEvent,
  FormEvent,
  ReactNode,
} from "react";
import { useRef, useState } from "react";

type IconName =
  | "audio"
  | "bot"
  | "check"
  | "clock"
  | "file"
  | "filter"
  | "folder"
  | "message"
  | "play"
  | "search"
  | "send"
  | "spark"
  | "upload"
  | "user"
  | "video";

type Tone = "teal" | "amber" | "rose" | "violet" | "ink";

type SourceFile = {
  name: string;
  kind: string;
  size: string;
  status: string;
  signal: string;
  icon: IconName;
  tone: Tone;
};

type SummaryBlock = {
  title: string;
  value: string;
  detail: string;
  tone: Tone;
};

type TimestampSegment = {
  title: string;
  source: string;
  range: string;
  topic: string;
  confidence: string;
  progress: number;
  tone: Tone;
};

type ChatMessage = {
  role: "assistant" | "user";
  author: string;
  message: string;
  meta?: string;
};

const sampleSources: SourceFile[] = [
  {
    name: "Q1 board report.pdf",
    kind: "PDF",
    size: "42 pages",
    status: "Indexed",
    signal: "18 high-value passages",
    icon: "file",
    tone: "teal",
  },
  {
    name: "Product demo walkthrough.mp4",
    kind: "Video",
    size: "28:42",
    status: "Transcribed",
    signal: "9 topic timestamps",
    icon: "video",
    tone: "rose",
  },
  {
    name: "Support call highlights.wav",
    kind: "Audio",
    size: "16:04",
    status: "Ready",
    signal: "6 speaker turns",
    icon: "audio",
    tone: "amber",
  },
];

const summaryBlocks: SummaryBlock[] = [
  {
    title: "Summary",
    value: "Pricing risk is the recurring theme across the report and call.",
    detail: "Most referenced evidence points to renewal friction, onboarding gaps, and demand for timestamped proof.",
    tone: "teal",
  },
  {
    title: "Coverage",
    value: "3 sources combined",
    detail: "PDF narrative, video transcript, and audio transcript are shown as one searchable workspace.",
    tone: "violet",
  },
  {
    title: "Next Answer",
    value: "Cites page and time ranges",
    detail: "Responses are designed to surface exact sources and play-ready media snippets.",
    tone: "amber",
  },
];

const timestampSegments: TimestampSegment[] = [
  {
    title: "Contract renewal objections",
    source: "Support call highlights.wav",
    range: "02:18 - 03:04",
    topic: "Pricing",
    confidence: "94%",
    progress: 18,
    tone: "amber",
  },
  {
    title: "Demo section on audit exports",
    source: "Product demo walkthrough.mp4",
    range: "11:42 - 12:36",
    topic: "Compliance",
    confidence: "91%",
    progress: 42,
    tone: "rose",
  },
  {
    title: "Stakeholder summary recap",
    source: "Product demo walkthrough.mp4",
    range: "21:05 - 22:10",
    topic: "Executive summary",
    confidence: "88%",
    progress: 76,
    tone: "violet",
  },
];

const baselineMessages: ChatMessage[] = [
  {
    role: "assistant",
    author: "Aiden",
    message:
      "I found the strongest answer in the board report and matched it with two media moments. The recurring risk is renewal friction caused by unclear pricing tiers.",
    meta: "Sources: board report page 12, support call 02:18, demo 11:42",
  },
  {
    role: "user",
    author: "You",
    message: "Where does the customer mention pricing confusion?",
  },
  {
    role: "assistant",
    author: "Aiden",
    message:
      "The clearest mention is in the support call between 02:18 and 03:04. The speaker asks whether overage pricing is per workspace or per team, then repeats the concern during the renewal discussion.",
    meta: "Timestamp answer with playable segment",
  },
];

const prompts = [
  "Summarize every uploaded source",
  "Find all mentions of security review",
  "Show video clips about onboarding",
];

const metricCards = [
  { label: "Sources", value: "3", delta: "PDF, audio, video" },
  { label: "Chunks", value: "186", delta: "semantic passages" },
  { label: "Coverage", value: "92%", delta: "answerable content" },
];

function Icon({ name, className = "size-4" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    audio: (
      <>
        <path d="M4 10v4" />
        <path d="M8 7v10" />
        <path d="M12 4v16" />
        <path d="M16 8v8" />
        <path d="M20 11v2" />
      </>
    ),
    bot: (
      <>
        <path d="M12 4v3" />
        <rect x="5" y="7" width="14" height="12" rx="3" />
        <path d="M9 12h.01" />
        <path d="M15 12h.01" />
        <path d="M9 16h6" />
      </>
    ),
    check: (
      <>
        <path d="M20 6 9 17l-5-5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </>
    ),
    file: (
      <>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
      </>
    ),
    folder: (
      <>
        <path d="M4 7h6l2 2h8v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <path d="M4 7V6a2 2 0 0 1 2-2h4l2 3" />
      </>
    ),
    message: (
      <>
        <path d="M5 6h14v10H9l-4 4z" />
        <path d="M8 10h8" />
        <path d="M8 13h5" />
      </>
    ),
    play: (
      <>
        <path d="M8 5v14l11-7z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 3.5 3.5" />
      </>
    ),
    send: (
      <>
        <path d="m4 12 16-8-7 16-2-7z" />
        <path d="m11 13 9-9" />
      </>
    ),
    spark: (
      <>
        <path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5z" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M5 20h14" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    video: (
      <>
        <rect x="4" y="6" width="12" height="12" rx="2" />
        <path d="m16 10 5-3v10l-5-3" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function toneClasses(tone: Tone) {
  switch (tone) {
    case "amber":
      return {
        badge: "bg-[#fff4d6] text-[#7a4a00] ring-[#f2cc76]",
        icon: "bg-[#fff4d6] text-[#a46200]",
        line: "bg-[#d99421]",
      };
    case "rose":
      return {
        badge: "bg-[#ffe8e4] text-[#953827] ring-[#efaaa0]",
        icon: "bg-[#ffe8e4] text-[#b24735]",
        line: "bg-[#d6533f]",
      };
    case "violet":
      return {
        badge: "bg-[#eee9ff] text-[#513b92] ring-[#c7b9ff]",
        icon: "bg-[#eee9ff] text-[#6248aa]",
        line: "bg-[#7c62c9]",
      };
    case "ink":
      return {
        badge: "bg-[#e8eceb] text-[#26312f] ring-[#c7d0cd]",
        icon: "bg-[#e8eceb] text-[#26312f]",
        line: "bg-[#24302e]",
      };
    case "teal":
    default:
      return {
        badge: "bg-[#dff7ef] text-[#12604f] ring-[#9fdfcf]",
        icon: "bg-[#dff7ef] text-[#137761]",
        line: "bg-[#159a7d]",
      };
  }
}

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 KB";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function kindFromFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (file.type.includes("pdf") || extension === "pdf") {
    return { kind: "PDF", icon: "file" as const, tone: "teal" as const };
  }

  if (file.type.startsWith("video")) {
    return { kind: "Video", icon: "video" as const, tone: "rose" as const };
  }

  if (file.type.startsWith("audio")) {
    return { kind: "Audio", icon: "audio" as const, tone: "amber" as const };
  }

  return { kind: "Source", icon: "file" as const, tone: "ink" as const };
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<SourceFile[]>([]);
  const [draft, setDraft] = useState("");
  const [localQuestions, setLocalQuestions] = useState<string[]>([]);
  const [activeSegment, setActiveSegment] = useState(timestampSegments[0]);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const nextFiles = Array.from(files).map((file) => {
      const fileKind = kindFromFile(file);
      return {
        name: file.name,
        kind: fileKind.kind,
        size: formatBytes(file.size),
        status: "Queued",
        signal: "Ready for indexing",
        icon: fileKind.icon,
        tone: fileKind.tone,
      };
    });

    setUploadedFiles((current) => [...nextFiles, ...current].slice(0, 6));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const handleAsk = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = draft.trim();

    if (!question) {
      return;
    }

    setLocalQuestions((current) => [question, ...current].slice(0, 3));
    setDraft("");
  };

  const visibleSources = uploadedFiles.length > 0 ? uploadedFiles : sampleSources;

  const liveMessages: ChatMessage[] = localQuestions.flatMap((question) => [
    {
      role: "user",
      author: "You",
      message: question,
    },
    {
      role: "assistant",
      author: "Aiden",
      message:
        "This UI has captured the question locally and is ready for a streaming answer once the backend endpoint is connected.",
      meta: "Frontend preview",
    },
  ]);

  const messages = [...liveMessages, ...baselineMessages];

  return (
    <main className="min-h-screen bg-[#f5f7f7] text-[#121817]">
      <header className="sticky top-0 z-30 border-b border-[#d9e1df] bg-[#f8faf9]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-[#12221f] text-white shadow-sm">
              <Icon name="spark" className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#60706c]">
                AIDoc Studio
              </p>
              <h1 className="truncate text-lg font-semibold tracking-normal text-[#101715] sm:text-xl">
                Document and Media Intelligence
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-md border border-[#d4dedb] bg-white px-3 py-2 text-[#384743] shadow-sm">
              <span className="size-2 rounded-full bg-[#159a7d]" />
              Workspace synced
            </div>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cfdad7] bg-white px-3 font-medium text-[#18211f] shadow-sm transition hover:border-[#aebeba] hover:bg-[#f1f5f4]"
              title="Filter sources"
              type="button"
            >
              <Icon name="filter" />
              Filter
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#12221f] px-3 font-medium text-white shadow-sm transition hover:bg-[#203532]"
              title="Start a new workspace"
              type="button"
            >
              <Icon name="folder" />
              New workspace
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[310px_minmax(0,1fr)_370px]">
        <aside className="space-y-4 lg:sticky lg:top-[84px] lg:h-[calc(100vh-104px)] lg:overflow-auto">
          <section className="rounded-lg border border-[#d6e0dd] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#121817]">
                  Source intake
                </p>
                <p className="mt-1 text-xs leading-5 text-[#667470]">
                  PDF, audio, and video files
                </p>
              </div>
              <span className="rounded-md bg-[#edf2f1] px-2 py-1 text-xs font-medium text-[#465651]">
                UI only
              </span>
            </div>

            <button
              aria-label="Upload PDF, audio, or video files"
              className="group flex min-h-44 w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#b8c8c3] bg-[#f8fbfa] p-5 text-center transition hover:border-[#159a7d] hover:bg-[#f1faf7]"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              type="button"
            >
              <span className="grid size-12 place-items-center rounded-md bg-[#dff7ef] text-[#137761] transition group-hover:bg-[#caefe4]">
                <Icon name="upload" className="size-6" />
              </span>
              <span className="mt-4 text-sm font-semibold text-[#17211f]">
                Add source files
              </span>
              <span className="mt-1 max-w-52 text-xs leading-5 text-[#667470]">
                Accepted formats: PDF, MP3, WAV, MP4, MOV
              </span>
            </button>
            <input
              ref={fileInputRef}
              accept=".pdf,application/pdf,audio/*,video/*"
              className="hidden"
              multiple
              onChange={handleFileChange}
              type="file"
            />

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { label: "PDF", icon: "file" as const },
                { label: "Audio", icon: "audio" as const },
                { label: "Video", icon: "video" as const },
              ].map((item) => (
                <div
                  className="rounded-md border border-[#dce5e2] bg-[#fbfcfc] p-2 text-[#52625e]"
                  key={item.label}
                >
                  <Icon className="mx-auto mb-1 size-4" name={item.icon} />
                  {item.label}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#d6e0dd] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#121817]">
                Source library
              </p>
              <span className="text-xs font-medium text-[#667470]">
                {visibleSources.length} items
              </span>
            </div>

            <div className="space-y-3">
              {visibleSources.map((source) => {
                const tone = toneClasses(source.tone);

                return (
                  <article
                    className="rounded-lg border border-[#dce5e2] bg-[#fbfcfc] p-3"
                    key={`${source.name}-${source.kind}`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`grid size-10 shrink-0 place-items-center rounded-md ${tone.icon}`}
                      >
                        <Icon name={source.icon} className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="break-words text-sm font-semibold leading-5 text-[#16201e]">
                            {source.name}
                          </h2>
                          <span
                            className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ${tone.badge}`}
                          >
                            {source.kind}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#64736f]">
                          <span>{source.size}</span>
                          <span>{source.status}</span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-[#43524e]">
                          {source.signal}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </aside>

        <section className="flex min-h-[760px] min-w-0 flex-col rounded-lg border border-[#d6e0dd] bg-white shadow-sm">
          <div className="border-b border-[#dce5e2] p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#121817]">
                  Ask across uploaded content
                </p>
                <p className="mt-1 text-xs leading-5 text-[#667470]">
                  Answers include source labels, timestamps, and playback cues.
                </p>
              </div>
              <div className="flex min-w-0 items-center gap-2 rounded-md border border-[#d7e1de] bg-[#f8faf9] px-3 py-2">
                <Icon className="size-4 shrink-0 text-[#64736f]" name="search" />
                <input
                  aria-label="Search indexed content"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#16201e] outline-none placeholder:text-[#80908b]"
                  placeholder="Search sources"
                  type="search"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {metricCards.map((metric) => (
                <div
                  className="rounded-lg border border-[#dce5e2] bg-[#fbfcfc] p-3"
                  key={metric.label}
                >
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6b7a76]">
                    {metric.label}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-2xl font-semibold text-[#121817]">
                      {metric.value}
                    </span>
                    <span className="text-right text-xs leading-4 text-[#667470]">
                      {metric.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="mb-4 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button
                  className="rounded-md border border-[#d7e1de] bg-[#f8faf9] px-3 py-2 text-xs font-medium text-[#34433f] transition hover:border-[#b4c4bf] hover:bg-[#eef5f3]"
                  key={prompt}
                  onClick={() => setDraft(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {messages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <article
                    className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                    key={`${message.author}-${index}-${message.message}`}
                  >
                    {!isUser ? (
                      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-[#12221f] text-white">
                        <Icon name="bot" />
                      </div>
                    ) : null}

                    <div
                      className={`max-w-[780px] rounded-lg border p-4 ${
                        isUser
                          ? "border-[#cbd9d5] bg-[#edf4f2]"
                          : "border-[#dce5e2] bg-[#fbfcfc]"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#667470]">
                        <span>{message.author}</span>
                        {message.meta ? (
                          <>
                            <span className="h-px w-4 bg-[#c4d1cd]" />
                            <span>{message.meta}</span>
                          </>
                        ) : null}
                      </div>
                      <p className="break-words text-sm leading-6 text-[#18211f]">
                        {message.message}
                      </p>
                    </div>

                    {isUser ? (
                      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-[#e6ecea] text-[#26312f]">
                        <Icon name="user" />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          <form
            className="border-t border-[#dce5e2] bg-[#f9fbfa] p-4"
            onSubmit={handleAsk}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                aria-label="Ask a question"
                className="min-h-20 flex-1 resize-none rounded-lg border border-[#cfdad7] bg-white px-3 py-3 text-sm leading-6 text-[#15201d] shadow-sm outline-none transition placeholder:text-[#81918c] focus:border-[#159a7d] focus:ring-4 focus:ring-[#dff7ef]"
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about summaries, citations, timestamps, or a specific uploaded file..."
                value={draft}
              />
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#12221f] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#203532] sm:self-end"
                type="submit"
              >
                <Icon name="send" />
                Ask
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-[84px] lg:h-[calc(100vh-104px)] lg:overflow-auto">
          <section className="rounded-lg border border-[#d6e0dd] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#121817]">
                Content summary
              </p>
              <span className="rounded-md bg-[#edf2f1] px-2 py-1 text-xs font-medium text-[#465651]">
                Updated now
              </span>
            </div>

            <div className="space-y-3">
              {summaryBlocks.map((block) => {
                const tone = toneClasses(block.tone);

                return (
                  <article
                    className="rounded-lg border border-[#dce5e2] bg-[#fbfcfc] p-3"
                    key={block.title}
                  >
                    <div className={`mb-3 h-1.5 w-12 rounded-md ${tone.line}`} />
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7a76]">
                      {block.title}
                    </p>
                    <h2 className="mt-2 text-sm font-semibold leading-5 text-[#121817]">
                      {block.value}
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-[#667470]">
                      {block.detail}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-[#d6e0dd] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#121817]">
                Timestamp matches
              </p>
              <Icon className="size-4 text-[#667470]" name="clock" />
            </div>

            <div className="space-y-3">
              {timestampSegments.map((segment) => {
                const tone = toneClasses(segment.tone);
                const isActive = segment.title === activeSegment.title;

                return (
                  <article
                    className={`rounded-lg border p-3 transition ${
                      isActive
                        ? "border-[#159a7d] bg-[#f1faf7]"
                        : "border-[#dce5e2] bg-[#fbfcfc]"
                    }`}
                    key={segment.title}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="break-words text-sm font-semibold leading-5 text-[#121817]">
                          {segment.title}
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-[#667470]">
                          {segment.source}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ${tone.badge}`}
                      >
                        {segment.topic}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#53635f]">
                      <span className="font-semibold text-[#121817]">
                        {segment.range}
                      </span>
                      <span>{segment.confidence} confidence</span>
                    </div>
                    <button
                      className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-[#cbd9d5] bg-white px-3 text-xs font-semibold text-[#18211f] shadow-sm transition hover:border-[#159a7d] hover:text-[#12604f]"
                      onClick={() => setActiveSegment(segment)}
                      type="button"
                    >
                      <Icon name="play" />
                      Play segment
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-[#d6e0dd] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#121817]">
                Media preview
              </p>
              <span className="rounded-md bg-[#12221f] px-2 py-1 text-xs font-semibold text-white">
                {activeSegment.range}
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#24302e] bg-[#141b1a] text-white shadow-sm">
              <div className="relative flex aspect-video items-center justify-center bg-[linear-gradient(135deg,#18211f,#203d35_52%,#452f37)]">
                <div className="absolute left-3 top-3 rounded-md bg-black/35 px-2 py-1 text-xs font-medium backdrop-blur">
                  {activeSegment.source.endsWith(".mp4") ? "Video" : "Audio"}
                </div>
                <button
                  className="grid size-14 place-items-center rounded-md bg-white text-[#12221f] shadow-lg transition hover:scale-[1.03]"
                  title="Preview selected timestamp"
                  type="button"
                >
                  <Icon name="play" className="size-7" />
                </button>
              </div>
              <div className="p-3">
                <div className="mb-3 flex items-center justify-between gap-3 text-xs text-[#c9d5d1]">
                  <span className="truncate">{activeSegment.title}</span>
                  <span className="shrink-0">{activeSegment.confidence}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-md bg-white/15">
                  <div
                    className="h-full rounded-md bg-[#45d0ad]"
                    style={{ width: `${activeSegment.progress}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-12 items-end gap-1">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <span
                      className="rounded-sm bg-white/35"
                      key={index}
                      style={{
                        height: `${10 + ((index * 7) % 28)}px`,
                        opacity: index / 36 < activeSegment.progress / 100 ? 0.9 : 0.28,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
