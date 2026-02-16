const roomContent = new Map<string, string>();

export function getRoomContent(roomId: string): string | undefined {
  return roomContent.get(roomId);
}

export function setRoomContent(roomId: string, html: string): void {
  roomContent.set(roomId, html);
}
