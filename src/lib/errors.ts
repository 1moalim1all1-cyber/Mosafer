export class AppError extends Error {
  code: string
  statusCode: number

  constructor(code: string, message: string, statusCode = 400) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
  }
}

export const handleError = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'حصل خطأ غير متوقع'
}
