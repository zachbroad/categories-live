interface IScoreStrategy {
  scoreGame(letter: string, prompts: string[], answers: string[]): void;
}

export default IScoreStrategy;
