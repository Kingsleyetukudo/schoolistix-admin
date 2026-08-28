export const downloadTextFile = (fileName: string, content: string, type = 'text/csv;charset=utf-8;') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export const toCsv = <T extends Record<string, unknown>>(rows: T[]) => {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const headerRow = headers.join(',')
  const dataRows = rows.map((row) =>
    headers.map((header) => JSON.stringify(row[header] ?? '')).join(','),
  )
  return [headerRow, ...dataRows].join('\n')
}
