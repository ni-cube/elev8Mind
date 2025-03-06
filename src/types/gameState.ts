export interface GameState {
    stars: number;
    level: number;
    currentIndex: number;
    insights?: string[],
    achievements?: string[],
    streak?: number,
    bdiScore?: number,
  }