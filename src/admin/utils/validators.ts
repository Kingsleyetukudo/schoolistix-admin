export const isRequired = (value: string | null | undefined) => String(value ?? '').trim().length > 0
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
export const minLength = (value: string, length: number) => String(value).trim().length >= length
