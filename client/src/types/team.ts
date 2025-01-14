export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  image?: string;
}

export interface Team {
  id: string;
  name: string;
  category: string;
  clubId: string;
  coachId: string;
  players: Player[];
  createdAt: string;
  updatedAt: string;
}
