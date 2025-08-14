<template>
  <div class="app dark-theme">
    <div class="app-background">
      <div class="background-pattern"></div>
    </div>
    
    <header class="header">
      <div class="container">
        <div class="header-content slide-in-up">
          <div class="title-section">
            <div class="title-icon pulse">
              <i class="pi pi-chart-bar"></i>
            </div>
            <div class="title-text">
              <h1 class="title">Algorithm Visualizer</h1>
              <p class="subtitle">Interactive Sorting Algorithm Visualization</p>
            </div>
          </div>
          
          <div class="header-stats">
            <div class="stat-chip">
              <i class="pi pi-code"></i>
              <span>2 Algorithms</span>
            </div>
            <div class="stat-chip">
              <i class="pi pi-palette"></i>
              <span>Dark Theme</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <div class="visualizer-layout">
          <div class="visualizer-section">
            <ArrayVisualizer 
              :elements="sortingState.array" 
              :is-animating="sortingState.isRunning"
            />
          </div>
          
          <div class="controls-section">
            <ControlPanel
              :current-algorithm="sortingState.currentAlgorithm"
              :is-running="sortingState.isRunning"
              :is-paused="sortingState.isPaused"
              :comparisons="sortingState.comparisons"
              :swaps="sortingState.swaps"
              :current-step="sortingState.currentStep"
              :initial-array-size="arraySize"
              :initial-speed="sortingState.speed"
              @select-algorithm="selectAlgorithm"
              @start="startSorting"
              @pause="togglePause"
              @reset="resetArray"
              @generate-array="generateRandomArray"
              @update-array-size="updateArraySize"
              @update-speed="updateSpeed"
              @set-manual-array="setManualArray"
            />
          </div>
        </div>

        <!-- Algorithm Information -->
        <Transition name="fade" mode="out-in">
          <Card v-if="sortingState.currentAlgorithm" class="algorithm-info-card slide-in-up">
            <template #title>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-info-circle text-primary"></i>
                <span>{{ algorithmInfo.name }}</span>
              </div>
            </template>
            
            <template #content>
              <div class="algorithm-info-content">
                <div class="complexity-grid">
                  <div class="complexity-item">
                    <div class="complexity-icon">
                      <i class="pi pi-clock"></i>
                    </div>
                    <div class="complexity-details">
                      <div class="complexity-label">Time Complexity</div>
                      <div class="complexity-value">{{ algorithmInfo.timeComplexity }}</div>
                    </div>
                  </div>
                  
                  <div class="complexity-item">
                    <div class="complexity-icon">
                      <i class="pi pi-database"></i>
                    </div>
                    <div class="complexity-details">
                      <div class="complexity-label">Space Complexity</div>
                      <div class="complexity-value">{{ algorithmInfo.spaceComplexity }}</div>
                    </div>
                  </div>
                  
                  <div class="complexity-item">
                    <div class="complexity-icon">
                      <i class="pi pi-shield"></i>
                    </div>
                    <div class="complexity-details">
                      <div class="complexity-label">Stability</div>
                      <div class="complexity-value">{{ algorithmInfo.stable ? 'Stable' : 'Unstable' }}</div>
                    </div>
                  </div>
                </div>
                
                <Divider />
                
                <div class="algorithm-description">
                  <h4>How it works:</h4>
                  <p>{{ algorithmInfo.description }}</p>
                </div>
              </div>
            </template>
          </Card>
        </Transition>
      </div>
    </main>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'
import ArrayVisualizer from './components/ArrayVisualizer.vue'
import ControlPanel from './components/ControlPanel.vue'
import { SortingAlgorithms } from './utils/sortingAlgorithms'
import type { ArrayElement, SortingState } from './types'

const toast = useToast()
const arraySize = ref(15)
const sortingInProgress = ref(false)

const sortingState = reactive<SortingState>({
  array: [],
  isRunning: false,
  isPaused: false,
  currentAlgorithm: null,
  speed: 3,
  comparisons: 0,
  swaps: 0,
  currentStep: 'Select an algorithm and configure your array to begin'
})

const algorithmInfo = computed(() => {
  const algorithms = {
    bubble: {
      name: 'Bubble Sort',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      stable: true,
      description: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. It gets its name because smaller elements "bubble" to the top of the list.'
    },
    insertion: {
      name: 'Insertion Sort',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      stable: true,
      description: 'Insertion Sort builds the final sorted array one item at a time. It works by taking elements from the unsorted portion and inserting them into their correct position in the sorted portion. It is efficient for small datasets and nearly sorted arrays.'
    }
  }
  
  return sortingState.currentAlgorithm ? algorithms[sortingState.currentAlgorithm] : null
})

function generateRandomArray(size: number = arraySize.value): void {
  sortingState.array = Array.from({ length: size }, (_, index) => ({
    value: Math.floor(Math.random() * 300) + 10,
    state: 'default' as const,
    id: `element-${index}-${Date.now()}`
  }))
  
  resetStats()
  sortingState.currentStep = 'Random array generated. Select an algorithm to begin visualization.'
  
  toast.add({
    severity: 'success',
    summary: 'Array Generated',
    detail: `Generated array with ${size} elements`,
    life: 3000
  })
}

function setManualArray(values: number[]): void {
  if (sortingState.isRunning) return
  
  sortingState.array = values.map((value, index) => ({
    value,
    state: 'default' as const,
    id: `element-${index}-${Date.now()}`
  }))
  
  arraySize.value = values.length
  resetStats()
  sortingState.currentStep = 'Custom array set. Select an algorithm to begin visualization.'
  
  toast.add({
    severity: 'info',
    summary: 'Custom Array Set',
    detail: `Array set with ${values.length} custom values`,
    life: 3000
  })
}

function selectAlgorithm(algorithm: 'bubble' | 'insertion'): void {
  if (sortingState.isRunning) return
  
  sortingState.currentAlgorithm = algorithm
  resetArray()
  
  const algorithmNames = {
    bubble: 'Bubble Sort',
    insertion: 'Insertion Sort'
  }
  
  sortingState.currentStep = `${algorithmNames[algorithm]} selected. Click Start to begin visualization.`
  
  toast.add({
    severity: 'info',
    summary: 'Algorithm Selected',
    detail: `${algorithmNames[algorithm]} is ready to run`,
    life: 3000
  })
}

async function startSorting(): Promise<void> {
  if (!sortingState.currentAlgorithm || sortingState.isRunning) return
  
  if (sortingState.array.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'No Array',
      detail: 'Please generate an array first',
      life: 3000
    })
    return
  }
  
  sortingState.isRunning = true
  sortingState.isPaused = false
  sortingInProgress.value = true
  
  const speedMs = [1000, 750, 500, 250, 100][sortingState.speed - 1]
  
  const updateCallback = (arr: ArrayElement[], step: string, comparisons: number, swaps: number) => {
    sortingState.array = arr
    sortingState.currentStep = step
    sortingState.comparisons = comparisons
    sortingState.swaps = swaps
  }
  
  const shouldStop = () => !sortingInProgress.value || sortingState.isPaused
  
  try {
    toast.add({
      severity: 'info',
      summary: 'Sorting Started',
      detail: `Running ${algorithmInfo.value?.name}`,
      life: 3000
    })
    
    if (sortingState.currentAlgorithm === 'bubble') {
      await SortingAlgorithms.bubbleSort(sortingState.array, updateCallback, speedMs, shouldStop)
    } else if (sortingState.currentAlgorithm === 'insertion') {
      await SortingAlgorithms.insertionSort(sortingState.array, updateCallback, speedMs, shouldStop)
    }
    
    if (!shouldStop()) {
      toast.add({
        severity: 'success',
        summary: 'Sorting Complete',
        detail: `Array sorted with ${sortingState.comparisons} comparisons and ${sortingState.swaps} swaps`,
        life: 5000
      })
    }
  } catch (error) {
    console.error('Sorting error:', error)
    toast.add({
      severity: 'error',
      summary: 'Sorting Error',
      detail: 'An error occurred during sorting',
      life: 3000
    })
  }
  
  sortingState.isRunning = false
  sortingInProgress.value = false
}

function togglePause(): void {
  sortingState.isPaused = !sortingState.isPaused
  
  const action = sortingState.isPaused ? 'paused' : 'resumed'
  toast.add({
    severity: 'info',
    summary: 'Sorting ' + action.charAt(0).toUpperCase() + action.slice(1),
    detail: `Visualization ${action}`,
    life: 2000
  })
  
  if (!sortingState.isPaused && sortingInProgress.value) {
    startSorting()
  }
}

function resetArray(): void {
  sortingInProgress.value = false
  sortingState.isRunning = false
  sortingState.isPaused = false
  
  // Reset all elements to default state
  sortingState.array.forEach(element => {
    element.state = 'default'
  })
  
  resetStats()
  
  if (sortingState.currentAlgorithm) {
    const algorithmNames = {
      bubble: 'Bubble Sort',
      insertion: 'Insertion Sort'
    }
    sortingState.currentStep = `${algorithmNames[sortingState.currentAlgorithm]} ready. Click Start to begin visualization.`
  } else {
    sortingState.currentStep = 'Select an algorithm to begin'
  }
  
  toast.add({
    severity: 'info',
    summary: 'Array Reset',
    detail: 'Array has been reset to initial state',
    life: 2000
  })
}

function resetStats(): void {
  sortingState.comparisons = 0
  sortingState.swaps = 0
}

function updateArraySize(size: number): void {
  if (sortingState.isRunning) return
  arraySize.value = size
  generateRandomArray(size)
}

function updateSpeed(speed: number): void {
  sortingState.speed = speed
  
  const speedLabels = {
    1: 'Very Slow',
    2: 'Slow', 
    3: 'Medium',
    4: 'Fast',
    5: 'Very Fast'
  }
  
  toast.add({
    severity: 'info',
    summary: 'Speed Updated',
    detail: `Animation speed set to ${speedLabels[speed as keyof typeof speedLabels]}`,
    life: 2000
  })
}

onMounted(() => {
  generateRandomArray()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.app-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.header {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(51, 65, 85, 0.3);
  padding: 24px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-size: 32px;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 16px;
  color: #cbd5e1;
  margin: 0;
  font-weight: 500;
}

.header-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 20px;
  font-size: 14px;
  color: #cbd5e1;
  backdrop-filter: blur(10px);
}

.main {
  padding: 32px 0;
}

.visualizer-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.visualizer-section {
  min-height: 400px;
}

.controls-section {
  max-height: fit-content;
}

.algorithm-info-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(51, 65, 85, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.algorithm-info-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.complexity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.complexity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(51, 65, 85, 0.3);
  transition: all 0.3s ease;
}

.complexity-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

.complexity-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.complexity-details {
  flex: 1;
}

.complexity-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
  font-weight: 500;
}

.complexity-value {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
}

.algorithm-description h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #f8fafc;
}

.algorithm-description p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #cbd5e1;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 1200px) {
  .visualizer-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .header-content {
    justify-content: center;
    text-align: center;
  }
  
  .title-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .title {
    font-size: 28px;
  }
  
  .title-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .complexity-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .main {
    padding: 24px 0;
  }
}
</style>
</template>