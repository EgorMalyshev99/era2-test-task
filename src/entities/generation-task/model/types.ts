export type GenType = 'text' | 'image' | 'video' | 'audio'

export type TaskStatus = 'queued' | 'running' | 'done' | 'failed' | 'canceled'

export interface GenerationTask {
  id: string
  type: GenType
  prompt: string
  model: string
  status: TaskStatus
  progress: number
  createdAt: number
  etaSeconds: number
  durationMs: number
  credits: number
  error?: string
  queuePosition?: number
}
