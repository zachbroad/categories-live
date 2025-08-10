import IScorer from './IScorer.js';
import PROMPT_MAP from './Prompts/PromptMap.js';

class BaseScorer implements IScorer {
  private prompt: string;

  constructor(promptRuleType: PromptRuleType) {
    this.prompt = PROMPT_MAP[promptRuleType];
  }

  async scoreGame(letter: string, prompts: string[], answers: string[]): Promise<number[]> {
    throw new Error('Method not implemented.');
  }

  protected formatPrompt(letter: string, prompts: string[], answers: string[]) {
    return (this as any).prompt.concat(
      `Letter: ${letter}\nPrompts: ${prompts}\nAnswers: ${answers}`
    );
  }
}

export default BaseScorer;
