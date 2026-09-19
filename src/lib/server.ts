import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase'

const functions = getFunctions(app, 'us-central1')

export async function callServer<T>(name: string, input: unknown): Promise<T> {
  try {
    const result = await httpsCallable<unknown, T>(functions, name)(input)
    return result.data
  } catch (error) {
    const cause = error as { code?: string; message?: string }
    if (cause.code === 'functions/unavailable' || cause.code === 'functions/internal') {
      throw new Error('الخدمة غير متاحة حاليًا. حاول مرة أخرى أو تواصل مع الدعم.')
    }
    throw new Error(cause.message || 'تعذر إتمام العملية، حاول مرة أخرى')
  }
}
