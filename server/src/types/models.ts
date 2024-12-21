export interface Club {
  id: string;
  name: string;
  logo?: string;
  country: string;
  city: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coach {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: 'HEAD_COACH' | 'ASSISTANT_COACH' | 'YOUTH_COACH';
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  clubId: string;
  coachId: string;
  name: string;
  category: 'FIRST_TEAM' | 'RESERVES' | 'U19' | 'U17' | 'U15';
  season: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  number: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  dateOfBirth: Date;
  nationality: string;
  height?: number;
  weight?: number;
  preferredFoot: 'LEFT' | 'RIGHT' | 'BOTH';
  createdAt: Date;
  updatedAt: Date;
}
