export function logError(error: unknown, context?: string): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[${context || 'Error'}]`, {
    message,
    stack,
    timestamp: new Date().toISOString(),
  });
}

export function logInfo(message: string, data?: unknown): void {
  console.log(`[Info]`, {
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}
