import 'dotenv/config';
import OpenAI from 'openai';
import BaseScorer from './BaseScorer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class ScoreStrategyOpenAI extends BaseScorer {
  private model: string;

  constructor(model: string, prompt: PromptRuleType) {
    super(prompt);
    this.model = model;
  }

  async scoreGame(letter: string, prompts: string[], answers: string[]): Promise<number[]> {
    const response = await openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'user',
          content: this.formatPrompt(letter, prompts, answers)
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content ?? '[]');
  }
}

export default ScoreStrategyOpenAI;
