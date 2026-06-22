import type {
  GenType,
  GenerationTask,
  TaskStatus,
} from '@/entities/generation-task'

const TYPES: GenType[] = ['text', 'image', 'video', 'audio']
const MODELS: Record<GenType, string> = {
  text: 'gpt-4o',
  image: 'dall-e-3',
  video: 'sora',
  audio: 'elevenlabs',
}
const STATUSES: TaskStatus[] = [
  'queued',
  'queued',
  'queued',
  'running',
  'done',
  'failed',
  'canceled',
]

const PROMPTS = [
  'Сгенерируй иллюстрацию заката над горами',
  'Напиши краткое описание продукта для лендинга',
  'Создай короткий видеоролик с анимацией логотипа',
  'Озвучь приветственное сообщение для подкаста',
  'Улучши качество портретной фотографии',
  'Сделай summary длинной статьи про нейросети',
]

export function generateStressTasks(count: number): GenerationTask[] {
  const now = Date.now()

  return Array.from({ length: count }, (_, index) => {
    const type = TYPES[index % TYPES.length]!
    const status = STATUSES[index % STATUSES.length]!
    const progress =
      status === 'running' ? 20 + (index % 60) : status === 'done' ? 100 : 0

    return {
      id: `stress-${now}-${index}`,
      type,
      prompt: `${PROMPTS[index % PROMPTS.length]!} #${index + 1}`,
      model: MODELS[type],
      status,
      progress,
      createdAt: now - index * 1000,
      etaSeconds: 30 + (index % 120),
      durationMs: 5000 + (index % 30000),
      credits: 1 + (index % 10),
      error: status === 'failed' ? 'Модель временно недоступна' : undefined,
    }
  })
}
