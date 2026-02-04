"use client";

import { useState } from "react";
import { blocksToHtml } from "@/lib/notion/blockParser";
import { getPageTitle } from "@/lib/notion/pageTitle";
import type { NotionBlock } from "@/lib/notion/types";

type PageItem = { id: string; properties?: Record<string, unknown> };

export function ControllerConnected() {
  const [databaseId, setDatabaseId] = useState("");
  const [list, setList] = useState<PageItem[] | null>(null);
  const [selectedHtml, setSelectedHtml] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = async () => {
    if (!databaseId.trim()) return;
    setIsLoadingList(true);
    setError(null);
    setList(null);
    setSelectedHtml(null);
    try {
      const res = await fetch(`/api/notion/databases/${databaseId.trim()}/query`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to load list");
      }
      const data = await res.json();
      setList(data.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load list");
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadDetail = async (pageId: string) => {
    setIsLoadingDetail(true);
    setError(null);
    setSelectedHtml(null);
    try {
      const res = await fetch(
        `/api/notion/blocks/${pageId}?recursive=true`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to load detail");
      }
      const data = await res.json();
      const results = data.results ?? [];
      const html = blocksToHtml(results as NotionBlock[]);
      setSelectedHtml(html);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load detail");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <h1 className="text-xl font-semibold">컨트롤러</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Notion에 연결되었습니다. Database ID를 입력한 뒤 목록을 불러오세요.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Notion Database ID"
          value={databaseId}
          onChange={(e) => setDatabaseId(e.target.value)}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          aria-label="Notion Database ID"
        />
        <button
          type="button"
          onClick={loadList}
          disabled={isLoadingList || !databaseId.trim()}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {isLoadingList ? "불러오는 중…" : "목록 불러오기"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-label="자막 목록">
          <h2 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            자막 목록
          </h2>
          {list === null ? (
            <p className="text-sm text-zinc-500">
              Database ID를 입력하고 목록 불러오기를 누르세요.
            </p>
          ) : list.length === 0 ? (
            <p className="text-sm text-zinc-500">항목이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {list.map((page) => (
                <li key={page.id}>
                  <button
                    type="button"
                    onClick={() => loadDetail(page.id)}
                    disabled={isLoadingDetail}
                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {getPageTitle(page)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="상세 보기">
          <h2 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            상세 (파싱 결과)
          </h2>
          {selectedHtml === null ? (
            <p className="text-sm text-zinc-500">
              목록에서 항목을 선택하면 여기에 내용이 표시됩니다.
            </p>
          ) : (
            <div
              className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-2 prose-li:my-0"
              dangerouslySetInnerHTML={{ __html: selectedHtml }}
            />
          )}
        </section>
      </div>
    </div>
  );
}
