import { PrompterView } from "./PrompterView";

type PrompterPageProps = {
  searchParams: Promise<{ room?: string }>;
};

export default async function PrompterPage({ searchParams }: PrompterPageProps) {
  const params = await searchParams;
  const initialRoomId = params.room?.trim() ?? "";
  return <PrompterView initialRoomId={initialRoomId} />;
}
