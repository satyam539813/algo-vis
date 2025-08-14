import { ArrayElement } from '../types';

export class SortingAlgorithms {
  static async bubbleSort(
    array: ArrayElement[],
    updateCallback: (arr: ArrayElement[], step: string, comparisons: number, swaps: number) => void,
    speedMs: number,
    shouldStop: () => boolean
  ): Promise<void> {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (shouldStop()) return;

        // Highlight elements being compared
        arr[j].state = 'comparing';
        arr[j + 1].state = 'comparing';
        comparisons++;

        updateCallback(
          [...arr],
          `Comparing ${arr[j].value} and ${arr[j + 1].value}`,
          comparisons,
          swaps
        );

        await this.delay(speedMs);

        if (arr[j].value > arr[j + 1].value) {
          // Highlight elements being swapped
          arr[j].state = 'swapping';
          arr[j + 1].state = 'swapping';
          swaps++;

          updateCallback(
            [...arr],
            `Swapping ${arr[j].value} and ${arr[j + 1].value}`,
            comparisons,
            swaps
          );

          await this.delay(speedMs);

          // Perform swap
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }

        // Reset states
        arr[j].state = 'default';
        arr[j + 1].state = 'default';
      }

      // Mark the last element as sorted
      arr[n - i - 1].state = 'sorted';
      updateCallback([...arr], `Element ${arr[n - i - 1].value} is in its final position`, comparisons, swaps);
      await this.delay(speedMs / 2);
    }

    // Mark the first element as sorted
    if (arr.length > 0) {
      arr[0].state = 'sorted';
    }

    updateCallback([...arr], 'Bubble sort completed!', comparisons, swaps);
  }

  static async insertionSort(
    array: ArrayElement[],
    updateCallback: (arr: ArrayElement[], step: string, comparisons: number, swaps: number) => void,
    speedMs: number,
    shouldStop: () => boolean
  ): Promise<void> {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;
    const n = arr.length;

    // Mark first element as sorted
    if (n > 0) {
      arr[0].state = 'sorted';
      updateCallback([...arr], 'First element is considered sorted', comparisons, swaps);
      await this.delay(speedMs);
    }

    for (let i = 1; i < n; i++) {
      if (shouldStop()) return;

      const current = arr[i];
      current.state = 'comparing';
      
      updateCallback([...arr], `Selecting element ${current.value} to insert`, comparisons, swaps);
      await this.delay(speedMs);

      let j = i - 1;

      while (j >= 0 && arr[j].value > current.value) {
        if (shouldStop()) return;

        arr[j].state = 'comparing';
        comparisons++;

        updateCallback(
          [...arr],
          `Comparing ${current.value} with ${arr[j].value}`,
          comparisons,
          swaps
        );

        await this.delay(speedMs);

        // Shift element to the right
        arr[j + 1] = { ...arr[j], state: 'swapping' };
        swaps++;

        updateCallback(
          [...arr],
          `Moving ${arr[j].value} one position right`,
          comparisons,
          swaps
        );

        await this.delay(speedMs);

        arr[j + 1].state = 'sorted';
        j--;
      }

      // Insert the current element
      arr[j + 1] = { ...current, state: 'sorted' };
      
      updateCallback([...arr], `Inserted ${current.value} at position ${j + 1}`, comparisons, swaps);
      await this.delay(speedMs);
    }

    updateCallback([...arr], 'Insertion sort completed!', comparisons, swaps);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}