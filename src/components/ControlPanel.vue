<template>
  <div class="control-panel-container">
    <!-- Algorithm Selection -->
    <Card class="control-card slide-in-up">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-cog text-primary"></i>
          <span>Algorithm Selection</span>
        </div>
      </template>
      
      <template #content>
        <div class="algorithm-selection">
          <SelectButton
            v-model="selectedAlgorithm"
            :options="algorithmOptions"
            option-label="label"
            option-value="value"
            :disabled="isRunning"
            @change="onAlgorithmChange"
            class="w-full"
          />
        </div>
      </template>
    </Card>

    <!-- Playback Controls -->
    <Card class="control-card slide-in-up">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-play text-primary"></i>
          <span>Playback Controls</span>
        </div>
      </template>
      
      <template #content>
        <div class="playback-controls">
          <Button
            @click="$emit('start')"
            :disabled="!currentAlgorithm || isRunning"
            severity="success"
            class="control-btn"
            :loading="isRunning && !isPaused"
          >
            <i class="pi pi-play mr-2"></i>
            Start
          </Button>
          
          <Button
            @click="$emit('pause')"
            :disabled="!isRunning"
            severity="warning"
            class="control-btn"
          >
            <i :class="isPaused ? 'pi pi-play' : 'pi pi-pause'" class="mr-2"></i>
            {{ isPaused ? 'Resume' : 'Pause' }}
          </Button>
          
          <Button
            @click="$emit('reset')"
            severity="danger"
            class="control-btn"
          >
            <i class="pi pi-refresh mr-2"></i>
            Reset
          </Button>
          
          <Button
            @click="$emit('generateArray')"
            :disabled="isRunning"
            severity="info"
            class="control-btn"
          >
            <i class="pi pi-refresh mr-2"></i>
            Generate
          </Button>
        </div>
      </template>
    </Card>

    <!-- Array Configuration -->
    <Card class="control-card slide-in-up">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-sliders-h text-primary"></i>
          <span>Array Configuration</span>
        </div>
      </template>
      
      <template #content>
        <div class="config-section">
          <div class="field">
            <label class="field-label">Array Size: {{ arraySize }}</label>
            <Slider
              v-model="arraySize"
              :min="5"
              :max="50"
              :step="1"
              :disabled="isRunning"
              @change="onArraySizeChange"
              class="w-full"
            />
          </div>
          
          <div class="field">
            <label class="field-label">Animation Speed: {{ speedLabel }}</label>
            <Slider
              v-model="speed"
              :min="1"
              :max="5"
              :step="1"
              @change="onSpeedChange"
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Manual Array Input -->
    <Card class="control-card slide-in-up">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-pencil text-primary"></i>
          <span>Manual Input</span>
        </div>
      </template>
      
      <template #content>
        <div class="manual-input-section">
          <div class="field">
            <label class="field-label">Enter comma-separated values:</label>
            <InputText
              v-model="manualInput"
              placeholder="e.g., 64, 34, 25, 12, 22, 11, 90"
              :disabled="isRunning"
              class="w-full"
              @keyup.enter="applyManualInput"
            />
          </div>
          
          <Button
            @click="applyManualInput"
            :disabled="isRunning || !manualInput.trim()"
            severity="secondary"
            class="w-full mt-2"
          >
            <i class="pi pi-check mr-2"></i>
            Apply Values
          </Button>
        </div>
      </template>
    </Card>

    <!-- Statistics -->
    <Card class="control-card slide-in-up stats-card">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-chart-line text-primary"></i>
          <span>Statistics</span>
        </div>
      </template>
      
      <template #content>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">
              <i class="pi pi-eye"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Comparisons</div>
              <div class="stat-value">{{ comparisons }}</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon">
              <i class="pi pi-arrows-h"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Swaps</div>
              <div class="stat-value">{{ swaps }}</div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Current Step -->
    <Card class="control-card slide-in-up step-card">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-info-circle text-primary"></i>
          <span>Current Step</span>
        </div>
      </template>
      
      <template #content>
        <div class="step-content">
          <p class="step-description">{{ currentStep }}</p>
          <ProgressBar 
            v-if="isRunning" 
            mode="indeterminate" 
            class="mt-3"
            style="height: 4px"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Slider from 'primevue/slider'
import InputText from 'primevue/inputtext'
import ProgressBar from 'primevue/progressbar'

interface Props {
  currentAlgorithm: 'bubble' | 'insertion' | null
  isRunning: boolean
  isPaused: boolean
  comparisons: number
  swaps: number
  currentStep: string
  initialArraySize: number
  initialSpeed: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectAlgorithm: [algorithm: 'bubble' | 'insertion']
  start: []
  pause: []
  reset: []
  generateArray: []
  updateArraySize: [size: number]
  updateSpeed: [speed: number]
  setManualArray: [values: number[]]
}>()

const selectedAlgorithm = ref(props.currentAlgorithm)
const arraySize = ref(props.initialArraySize)
const speed = ref(props.initialSpeed)
const manualInput = ref('')

const algorithmOptions = [
  { label: 'Bubble Sort', value: 'bubble' },
  { label: 'Insertion Sort', value: 'insertion' }
]

const speedLabel = computed(() => {
  const labels = {
    1: 'Very Slow',
    2: 'Slow',
    3: 'Medium',
    4: 'Fast',
    5: 'Very Fast'
  }
  return labels[speed.value as keyof typeof labels]
})

const onAlgorithmChange = () => {
  if (selectedAlgorithm.value) {
    emit('selectAlgorithm', selectedAlgorithm.value)
  }
}

const onArraySizeChange = () => {
  emit('updateArraySize', arraySize.value)
}

const onSpeedChange = () => {
  emit('updateSpeed', speed.value)
}

const applyManualInput = () => {
  if (!manualInput.value.trim()) return
  
  try {
    const values = manualInput.value
      .split(',')
      .map(v => parseInt(v.trim()))
      .filter(v => !isNaN(v) && v > 0 && v <= 999)
    
    if (values.length > 0) {
      emit('setManualArray', values)
      manualInput.value = ''
    }
  } catch (error) {
    console.error('Invalid input format')
  }
}

watch(() => props.currentAlgorithm, (newAlgorithm) => {
  selectedAlgorithm.value = newAlgorithm
})

watch(() => props.initialArraySize, (newSize) => {
  arraySize.value = newSize
})

watch(() => props.initialSpeed, (newSpeed) => {
  speed.value = newSpeed
})
</script>

<style scoped>
.control-panel-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(51, 65, 85, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.control-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.algorithm-selection {
  width: 100%;
}

.playback-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.control-btn {
  transition: all 0.3s ease;
}

.control-btn:hover {
  transform: translateY(-1px);
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
}

.manual-input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(51, 65, 85, 0.3);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
}

.step-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.step-content {
  display: flex;
  flex-direction: column;
}

.step-description {
  margin: 0;
  font-size: 14px;
  color: #cbd5e1;
  line-height: 1.5;
  font-weight: 500;
}

@media (max-width: 768px) {
  .playback-controls {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .control-card {
    margin-bottom: 16px;
  }
}
</style>
</template>