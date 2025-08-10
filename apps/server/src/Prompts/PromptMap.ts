import PromptStrict from './PromptStrict';
import PromptLenient from './PromptLenient';

const PROMPT_MAP = {
  strict: PromptStrict,
  lenient: PromptLenient
} as const;

export default PROMPT_MAP;
