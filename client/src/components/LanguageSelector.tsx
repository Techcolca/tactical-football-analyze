import React from 'react';
import { ButtonGroup, Button } from '@mui/material';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <ButtonGroup variant="contained" size="small">
      <Button
        onClick={() => onLanguageChange('en')}
        color={selectedLanguage === 'en' ? 'secondary' : 'primary'}
      >
        English
      </Button>
      <Button
        onClick={() => onLanguageChange('es')}
        color={selectedLanguage === 'es' ? 'secondary' : 'primary'}
      >
        Español
      </Button>
      <Button
        onClick={() => onLanguageChange('fr')}
        color={selectedLanguage === 'fr' ? 'secondary' : 'primary'}
      >
        Français
      </Button>
    </ButtonGroup>
  );
};

export default LanguageSelector;
