import Room from './Room';
import RoomStatus from './RoomStatus';
import Game from './Game';

export enum GameState {
  LOBBY = 'LOBBY',
  STARTING = 'STARTING',
  IN_PROGRESS = 'IN_PROGRESS',
  SCORING = 'SCORING',
  RESULTS = 'RESULTS',
  GAME_OVER = 'GAME_OVER'
}

interface StateConfig {
  onEnter?: () => Promise<void> | void;
  onExit?: () => Promise<void> | void;
  maxDuration?: number; // in seconds
  canTransitionTo: (nextState: GameState) => boolean;
  shouldAutoProgress?: () => boolean;
}

export class GameStateMachine {
  private currentState: GameState;
  private room: Room;
  private stateConfigs: Map<GameState, StateConfig>;
  private timeoutHandle?: NodeJS.Timeout;
  private isTransitioning: boolean = false;

  constructor(room: Room) {
    this.room = room;
    this.currentState = GameState.LOBBY;
    this.stateConfigs = this.initializeStateConfigs();
  }

  private initializeStateConfigs(): Map<GameState, StateConfig> {
    const configs = new Map<GameState, StateConfig>();

    // LOBBY state - waiting for players
    configs.set(GameState.LOBBY, {
      onEnter: () => {
        this.room.status = RoomStatus.Waiting;
        this.room.updateRoom();
      },
      canTransitionTo: (next) => next === GameState.STARTING,
    });

    // STARTING state - countdown before round
    configs.set(GameState.STARTING, {
      onEnter: () => {
        console.log(`[${this.room.slug}] Starting countdown...`);
        this.room.status = RoomStatus.Starting;
        this.room.updateRoom();
        
        // Auto-progress after countdown
        this.setStateTimeout(Game.LOBBY_DURATION, () => {
          this.transition(GameState.IN_PROGRESS);
        });
      },
      maxDuration: Game.LOBBY_DURATION,
      canTransitionTo: (next) => next === GameState.IN_PROGRESS,
    });

    // IN_PROGRESS state - players answering
    configs.set(GameState.IN_PROGRESS, {
      onEnter: () => {
        console.log(`[${this.room.slug}] Round in progress...`);
        this.room.status = RoomStatus.InProgress;
        this.room.updateRoom();
        
        // Set max duration timeout
        this.setStateTimeout(Game.ROUND_DURATION, () => {
          console.log(`[${this.room.slug}] Round timeout, moving to scoring...`);
          this.transition(GameState.SCORING);
        });
      },
      onExit: () => {
        // Request any remaining answers
        this.room.requestAnswers();
      },
      maxDuration: Game.ROUND_DURATION,
      canTransitionTo: (next) => next === GameState.SCORING,
      shouldAutoProgress: () => {
        // Auto-progress if everyone has submitted
        return this.room.hasEveryoneSubmittedAnswers();
      }
    });

    // SCORING state - AI scoring answers
    configs.set(GameState.SCORING, {
      onEnter: async () => {
        console.log(`[${this.room.slug}] Scoring answers...`);
        this.room.status = RoomStatus.Scoring;
        this.room.updateRoom();
        
        // Wait a moment for any final submissions
        setTimeout(async () => {
          if (this.room.game && !this.room.game.hasBeenScored) {
            await this.room.handleScoring();
          }
          // Auto-transition to results after scoring
          this.transition(GameState.RESULTS);
        }, Game.WAIT_FOR_ANSWERS_DURATION * 1000);
      },
      maxDuration: Game.WAIT_FOR_ANSWERS_DURATION + 5, // Extra time for scoring
      canTransitionTo: (next) => next === GameState.RESULTS,
    });

    // RESULTS state - showing scores
    configs.set(GameState.RESULTS, {
      onEnter: () => {
        console.log(`[${this.room.slug}] Showing results...`);
        this.room.status = RoomStatus.Results;
        this.room.updateRoom();
        
        // Set timeout for auto-progression
        this.setStateTimeout(Game.RESULTS_DURATION, () => {
          this.handleResultsTimeout();
        });
      },
      maxDuration: Game.RESULTS_DURATION,
      canTransitionTo: (next) => 
        next === GameState.STARTING || next === GameState.GAME_OVER || next === GameState.LOBBY,
      shouldAutoProgress: () => {
        // Auto-progress if everyone clicked ready
        return this.room.isEveryoneReadyToGoToLobby();
      }
    });

    // GAME_OVER state - final results
    configs.set(GameState.GAME_OVER, {
      onEnter: () => {
        console.log(`[${this.room.slug}] Game over!`);
        // Game is finished, return to lobby
        this.transition(GameState.LOBBY);
      },
      canTransitionTo: (next) => next === GameState.LOBBY,
    });

    return configs;
  }

  public getCurrentState(): GameState {
    return this.currentState;
  }

  public async transition(to: GameState): Promise<boolean> {
    // Prevent concurrent transitions
    if (this.isTransitioning) {
      console.log(`[${this.room.slug}] Transition already in progress, skipping...`);
      return false;
    }

    const currentConfig = this.stateConfigs.get(this.currentState);
    if (!currentConfig) {
      console.error(`[${this.room.slug}] No config for current state: ${this.currentState}`);
      return false;
    }

    // Check if transition is allowed
    if (!currentConfig.canTransitionTo(to)) {
      console.log(`[${this.room.slug}] Cannot transition from ${this.currentState} to ${to}`);
      return false;
    }

    this.isTransitioning = true;
    console.log(`[${this.room.slug}] Transitioning from ${this.currentState} to ${to}`);

    // Clear any existing timeout
    this.clearStateTimeout();

    // Call exit handler for current state
    if (currentConfig.onExit) {
      await currentConfig.onExit();
    }

    // Update state
    const previousState = this.currentState;
    this.currentState = to;

    // Call enter handler for new state
    const newConfig = this.stateConfigs.get(to);
    if (newConfig?.onEnter) {
      await newConfig.onEnter();
    }

    this.isTransitioning = false;

    // Emit state change event
    this.room.sendToAllClients('room:stateChange', {
      from: previousState,
      to: this.currentState
    });

    return true;
  }

  public checkAutoProgress(): void {
    const config = this.stateConfigs.get(this.currentState);
    if (!config?.shouldAutoProgress) return;

    if (config.shouldAutoProgress()) {
      console.log(`[${this.room.slug}] Auto-progressing from ${this.currentState}`);
      
      switch (this.currentState) {
        case GameState.IN_PROGRESS:
          this.transition(GameState.SCORING);
          break;
        case GameState.RESULTS:
          this.handleResultsTimeout();
          break;
      }
    }
  }

  private handleResultsTimeout(): void {
    // Check if there are more rounds
    if (this.room.game && this.room.game.currentRound < this.room.game.rounds) {
      // Move to next round
      this.room.currentRound++;
      this.room.setUpNewGame();
      this.transition(GameState.STARTING);
    } else {
      // Game is over
      this.transition(GameState.GAME_OVER);
    }
  }

  private setStateTimeout(seconds: number, callback: () => void): void {
    this.clearStateTimeout();
    this.timeoutHandle = setTimeout(callback, seconds * 1000);
  }

  private clearStateTimeout(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
  }

  public reset(): void {
    this.clearStateTimeout();
    this.currentState = GameState.LOBBY;
    this.isTransitioning = false;
  }
}

export default GameStateMachine;