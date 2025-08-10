import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import 'dotenv/config';
import { z } from 'zod';
import PROMPT_MAP from './Prompts/PromptMap';

// Comprehensive list of available OpenAI models
type OpenAIAvailableModel =
  | "gpt-4.1" | "gpt-4.1-2025-04-14" | "gpt-4.1-mini" | "gpt-4.1-mini-2025-04-14"
  | "gpt-4.1-nano" | "gpt-4.1-nano-2025-04-14"
  | "gpt-4o" | "gpt-4o-2024-05-13" | "gpt-4o-2024-08-06" | "gpt-4o-2024-11-20"
  | "gpt-4o-audio-preview" | "gpt-4o-audio-preview-2024-10-01" | "gpt-4o-audio-preview-2024-12-17"
  | "gpt-4o-search-preview" | "gpt-4o-search-preview-2025-03-11"
  | "gpt-4o-mini-search-preview" | "gpt-4o-mini-search-preview-2025-03-11"
  | "gpt-4o-mini" | "gpt-4o-mini-2024-07-18"
  | "gpt-4-turbo" | "gpt-4-turbo-2024-04-09" | "gpt-4-turbo-preview"
  | "gpt-4-0125-preview" | "gpt-4-1106-preview"
  | "gpt-4" | "gpt-4-0613"
  | "gpt-4.5-preview" | "gpt-4.5-preview-2025-02-27"
  | "gpt-3.5-turbo-0125" | "gpt-3.5-turbo" | "gpt-3.5-turbo-1106"
  | "chatgpt-4o-latest"
  | "o1" | "o1-2024-12-17"
  | "o3-mini" | "o3-mini-2025-01-31"
  | "o3" | "o3-2025-04-16"
  | "o4-mini" | "o4-mini-2025-04-16"
  | "codex-mini-latest"
  | "computer-use-preview"
  | "gpt-5" | "gpt-5-2025-08-07" | "gpt-5-mini" | "gpt-5-mini-2025-08-07"
  | "gpt-5-nano" | "gpt-5-nano-2025-08-07" | "gpt-5-chat-latest";

export class OpenAIScorer {
  private model: OpenAIAvailableModel;
  private promptRuleType: PromptRuleType;
  private prompt: string;

  constructor(model: OpenAIAvailableModel = 'gpt-4o-mini', promptRuleType: PromptRuleType = 'strict') {
    this.model = model;
    this.promptRuleType = promptRuleType;
    this.prompt = PROMPT_MAP[promptRuleType];
  }

  async scoreGame(letter: string, prompts: string[], answers: string[]): Promise<number[]> {
    const formattedPrompt = this.formatPrompt(letter, prompts, answers);

    try {
      const { object } = await generateObject({
        model: openai(this.model),
        prompt: formattedPrompt,
        schema: z.object({
          scores: z.array(z.number()).length(answers.length)
        })
      });

      // Parse the response and validate it's an array of numbers
      const scores = object.scores;
      if (!Array.isArray(scores) || scores.length !== answers.length) {
        throw new Error('Invalid response format from OpenAI');
      }

      return scores;
    } catch (error) {
      console.error('Error scoring game:', error);
      // Return all zeros on error to avoid breaking the game
      return answers.map(() => 0);
    }
  }

  private formatPrompt(letter: string, prompts: string[], answers: string[]): string {
    return this.prompt + `
Letter: ${letter}
Prompts: ${JSON.stringify(prompts)}
Answers: ${JSON.stringify(answers)}
`;
  }
}

// Preset configurations for easy use
export const Scorers = {
  STRICT_GPT4o: new OpenAIScorer('gpt-4o', 'strict'),
  LENIENT_GPT4o: new OpenAIScorer('gpt-4o', 'lenient'),
  STRICT_GPT4o_Mini: new OpenAIScorer('gpt-4o-mini', 'strict'),
  LENIENT_GPT4o_Mini: new OpenAIScorer('gpt-4o-mini', 'lenient'),
  // Additional fast options
  STRICT_GPT5_Nano: new OpenAIScorer('gpt-5-nano', 'strict'),
  LENIENT_GPT5_Nano: new OpenAIScorer('gpt-5-nano', 'lenient')
};

export default OpenAIScorer;