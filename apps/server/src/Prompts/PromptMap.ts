import PromptStrict from './PromptStrict.js';
import PromptLenient from './PromptLenient.js';

const PROMPT_MAP = {
  strict: PromptStrict,
  lenient: PromptLenient
} as const;

export default PROMPT_MAP;
