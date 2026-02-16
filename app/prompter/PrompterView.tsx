"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const SCROLL_SPEED_PX_PER_SEC = 40;

type PrompterViewProps = {
  initialRoomId: string;
};

export function PrompterView({ initialRoomId }: PrompterViewProps) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [roomInput, setRoomInput] = useState("");
  const [html, setHtml] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [mirror, setMirror] = useState(false);
  const [connected, setConnected] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollOffsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const connect = useCallback((id: string) => {
    const trimmed = id.trim();
    if (trimmed) setRoomId(trimmed);
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!roomId || !client) return;
    setConnected(false);
    setHtml("");
    const channel = client.channel(roomId);
    channel
      .on("broadcast", { event: "play" }, () => setIsPlaying(true))
      .on("broadcast", { event: "pause" }, () => setIsPlaying(false))
      .on("broadcast", { event: "mirror" }, (payload) => {
        const m = (payload.payload as { mirror?: boolean })?.mirror;
        if (typeof m === "boolean") setMirror(m);
      })
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    const loadContent = async () => {
      try {
        const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/content`);
        if (res.ok) {
          const data = await res.json();
          setHtml(data.html ?? "");
        }
      } catch {
        // ignore
      }
    };
    loadContent();

    return () => {
      client.removeChannel(channel);
      setConnected(false);
    };
  }, [roomId]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    lastTimeRef.current = performance.now();
    scrollOffsetRef.current = 0;
    setScrollOffset(0);

    const tick = (now: number) => {
      const elapsed = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const container = containerRef.current;
      const content = contentRef.current;
      if (container && content) {
        const maxOffset = Math.max(
          0,
          content.scrollHeight - container.clientHeight
        );
        scrollOffsetRef.current = Math.min(
          scrollOffsetRef.current + SCROLL_SPEED_PX_PER_SEC * elapsed,
          maxOffset
        );
        setScrollOffset(scrollOffsetRef.current);
        if (scrollOffsetRef.current >= maxOffset && maxOffset > 0) {
          setIsPlaying(false);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  if (!roomId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black p-8">
        <h1 className="text-xl font-semibold text-white">프롬프터</h1>
        <p className="text-zinc-400">접속 코드(Room ID)를 입력하세요.</p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            connect(roomInput);
          }}
        >
          <input
            type="text"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="Room ID"
            className="rounded border border-zinc-600 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500"
            aria-label="접속 코드"
          />
          <button
            type="submit"
            className="rounded bg-white px-4 py-3 text-sm font-medium text-black"
          >
            접속
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-black text-white"
    >
      <div
        ref={contentRef}
        className="absolute left-0 right-0 top-0 px-8 py-12 will-change-transform"
        style={{
          transform: `translateY(-${scrollOffset}px)${mirror ? " scaleX(-1)" : ""}`,
        }}
      >
        <div
          className="prose prose-invert max-w-none prose-p:my-2 prose-headings:my-4 prose-ul:my-2 prose-li:my-0"
          style={{ color: "white" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {connected && !html && (
        <p className="absolute left-8 top-8 text-sm text-zinc-500">
          컨트롤러에서 자막을 선택하면 여기에 표시됩니다.
        </p>
      )}
    </div>
  );
}
