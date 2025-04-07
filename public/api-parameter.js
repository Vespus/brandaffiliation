// config/llmParameters.js

const LLM_CONFIG = {
    openai: {
      OPENAI_MAX_TOKENS: {
        label: "Max Tokens",
        type: "slider",
        range: [1, 4096], // bei GPT-4-32k z. B. bis 32768
        default: 3000,
        recommended: 3000,
        quicktip: "Begrenzt die Länge der Antwort. Weniger Tokens = schneller & günstiger."
      },
      OPENAI_TEMPERATURE: {
        label: "Temperature",
        type: "slider",
        range: [0.0, 2.0],
        step: 0.1,
        default: 0.7,
        recommended: 0.7,
        quicktip: "Niedriger = präziser, höher = kreativer. Für Brainstorming z. B. 1.2."
      },
      OPENAI_TOP_P: {
        label: "Top P",
        type: "slider",
        range: [0.0, 1.0],
        step: 0.05,
        default: 0.9,
        recommended: 0.9,
        quicktip: "Alternativ zu Temperature: 0.9 gibt kontrollierte Vielfalt."
      },
      OPENAI_PRESENCE_PENALTY: {
        label: "Presence Penalty",
        type: "slider",
        range: [-2.0, 2.0],
        step: 0.1,
        default: 0.6,
        recommended: 0.6,
        quicktip: "Fördert neue Themen im Output – nützlich für kreatives Schreiben."
      },
      OPENAI_FREQUENCY_PENALTY: {
        label: "Frequency Penalty",
        type: "slider",
        range: [-2.0, 2.0],
        step: 0.1,
        default: 0.3,
        recommended: 0.3,
        quicktip: "Reduziert Wortwiederholungen – ideal für Listen & längere Texte."
      }
    },
  
    claude: {
      CLAUDE_MAX_TOKENS: {
        label: "Max Tokens",
        type: "slider",
        range: [1, 20000], // Claude 3 Opus kann über 200k verarbeiten
        default: 4096,
        recommended: 8000,
        quicktip: "Je höher, desto mehr Kontext und längere Antworten – aber langsamer."
      },
      CLAUDE_TEMPERATURE: {
        label: "Temperature",
        type: "slider",
        range: [0.0, 1.0],
        step: 0.05,
        default: 0.7,
        recommended: 0.5,
        quicktip: "Niedriger = logischer, höher = kreativer. Claude ist generell kreativ genug."
      },
      CLAUDE_MODEL: {
        label: "Claude Model",
        type: "dropdown",
        options: [
          { value: "claude-3-7-sonnet-20250219", label: "Claude 3 Sonnet (2025-02-19)" },
          { value: "claude-3-7-sonnet-20240229", label: "Claude 3 Sonnet (2024-02-29)" },
          { value: "claude-3-5-haiku-20241022", label: "Claude 3 Haiku (2024-10-22)" }
        ],
        default: "claude-3-7-sonnet-20250219",
        recommended: "claude-3-7-sonnet-20250219",
        quicktip: "Sonnet = höchste Qualität, Haiku = super schnell & günstig."
      }
    }
  };
  
  export default LLM_CONFIG;
  