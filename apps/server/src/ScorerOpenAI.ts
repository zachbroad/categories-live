import OpenAI from 'openai';
import IScorer from './IScorer';
import BaseScorer from './BaseScorer';

class ScorerOpenAI extends BaseScorer implements IScorer {
  constructor(
    private model: string,
    private promptRuleType: PromptRuleType,
    private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  ) {
    super(promptRuleType);
  }

  async scoreGame(letter: string, prompts: string[], answers: string[]): Promise<number[]> {
    const prompt = this.formatPrompt(letter, prompts, answers);

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 128,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.0
    });

    return JSON.parse(response.choices[0].message.content ?? '');
  }
}

export default ScorerOpenAI;
