export interface ArrayElement {
  value: number;
  state: 'default' | 'comparing' | 'swapping' | 'sorted';
  id: string;
}

export interface SortingState {
  array: ArrayElement[];
  isRunning: boolean;
  isPaused: boolean;
  currentAlgorithm: 'bubble' | 'insertion' | null;
  speed: number;
  comparisons: number;
  swaps: number;
  currentStep: string;
}