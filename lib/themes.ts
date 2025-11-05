import type { ThemeConfig } from './types';

export const FORM_THEMES: Record<string, ThemeConfig> = {
  default: {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter, system-ui, sans-serif',
    buttonStyle: 'rounded',
  },
  minimal: {
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    buttonStyle: 'square',
  },
  modern: {
    primaryColor: '#8b5cf6',
    backgroundColor: '#fafafa',
    textColor: '#0f172a',
    fontFamily: 'Inter, system-ui, sans-serif',
    buttonStyle: 'rounded',
  },
  playful: {
    primaryColor: '#f59e0b',
    backgroundColor: '#fef3c7',
    textColor: '#78350f',
    fontFamily: 'Quicksand, sans-serif',
    buttonStyle: 'pill',
  },
  professional: {
    primaryColor: '#1e40af',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    fontFamily: 'IBM Plex Sans, sans-serif',
    buttonStyle: 'rounded',
  },
};

export function getThemeStyles(theme: string, customConfig?: ThemeConfig): string {
  const baseTheme = FORM_THEMES[theme] || FORM_THEMES.default;
  const config = { ...baseTheme, ...customConfig };

  return `
    :root {
      --form-primary: ${config.primaryColor};
      --form-bg: ${config.backgroundColor};
      --form-text: ${config.textColor};
      --form-font: ${config.fontFamily};
    }
    
    .form-container {
      background-color: var(--form-bg);
      color: var(--form-text);
      font-family: var(--form-font);
    }
    
    .form-button {
      background-color: var(--form-primary);
      ${config.buttonStyle === 'pill' ? 'border-radius: 9999px;' : ''}
      ${config.buttonStyle === 'square' ? 'border-radius: 0;' : ''}
      ${config.buttonStyle === 'rounded' ? 'border-radius: 0.5rem;' : ''}
    }
    
    .form-input:focus {
      border-color: var(--form-primary);
      ring-color: var(--form-primary);
    }
    
    ${config.backgroundImage ? `
    .form-container {
      background-image: url(${config.backgroundImage});
      background-size: cover;
      background-position: center;
    }
    ` : ''}
    
    ${config.customCSS || ''}
  `;
}
