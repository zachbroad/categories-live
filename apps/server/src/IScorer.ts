interface IScorer {
  scoreGame(letter: string, prompts: string[], answers: string[]): Promise<number[]>;
}

export default IScorer;
