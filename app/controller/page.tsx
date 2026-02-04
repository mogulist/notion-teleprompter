import { cookies } from "next/headers";
import { getNotionAuthorizationUrl } from "@/lib/notion/auth";
import { NOTION_TOKEN_COOKIE } from "@/lib/notion/cookies";
import { ControllerConnected } from "./ControllerConnected";

export default async function ControllerPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(NOTION_TOKEN_COOKIE)?.value;

  if (!token) {
    const authUrl = getNotionAuthorizationUrl();
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-xl font-semibold">컨트롤러</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Notion과 연결하면 자막 목록을 불러올 수 있습니다.
        </p>
        <a
          href={authUrl}
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Notion과 연결하기
        </a>
      </div>
    );
  }

  return <ControllerConnected />;
}
