import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';

interface LanguageSelectorProps {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  setSelectedLanguage,
}) => {
  const handleLanguageChange = (
    event: React.MouseEvent<HTMLElement>,
    newLanguage: string | null
  ) => {
    if (newLanguage !== null) {
      setSelectedLanguage(newLanguage);
      // Guardar la preferencia de idioma en localStorage
      localStorage.setItem('preferredLanguage', newLanguage);
    }
  };

  return (
    <ToggleButtonGroup
      value={selectedLanguage}
      exclusive
      onChange={handleLanguageChange}
      aria-label="language selector"
      size="small"
      sx={{
        backgroundColor: 'white',
        '& .MuiToggleButton-root': {
          padding: '4px 12px',
          textTransform: 'none',
          '&.Mui-selected': {
            backgroundColor: '#1976d2',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          },
        },
      }}
    >
      <ToggleButton value="en" aria-label="english">
        ENGLISH
      </ToggleButton>
      <ToggleButton value="es" aria-label="español">
        ESPAÑOL
      </ToggleButton>
      <ToggleButton value="fr" aria-label="français">
        FRANÇAIS
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default LanguageSelector;
