import axios from 'axios';

const API_URL = 'http://localhost:3006/api/formations';

interface FormationResponse {
  formation: {
    frames: Array<{
      timestamp: number;
      players: Array<{
        id: string;
        name: string;
        number: number;
        position: string;
        rating: number;
        x: number;
        y: number;
      }>;
      drawings: any[];
    }>;
  };
  analysis: string;
}

export const generateFormation = async (formationString: string): Promise<FormationResponse> => {
  try {
    const response = await axios.post<FormationResponse>(`${API_URL}/generate`, {
      formation: formationString
    });
    return response.data;
  } catch (error) {
    console.error('Error generating formation:', error);
    throw new Error('Failed to generate formation');
  }
};
