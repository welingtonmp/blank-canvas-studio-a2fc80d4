export interface Participant {
  id: string;
  name: string;
  phone: string;
  photoUrl: string;
  isRevendedora: boolean;
  badgeUrl?: string;
  createdAt: string;
  number: number;
}

const STORAGE_KEY = "ap_cosmeticos_participants";

export function getParticipants(): Participant[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveParticipant(p: Participant): void {
  const list = getParticipants();
  list.push(p);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function updateParticipantBadge(id: string, badgeUrl: string): void {
  const list = getParticipants();
  const idx = list.findIndex((p) => p.id === id);
  if (idx !== -1) {
    list[idx].badgeUrl = badgeUrl;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export function getNextNumber(): number {
  const list = getParticipants();
  return list.length + 1;
}
