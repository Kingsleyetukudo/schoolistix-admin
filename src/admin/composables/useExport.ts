import { downloadTextFile, toCsv } from '@admin/utils/exportHelpers'

export function useExport() {
  const exportRows = <T extends Record<string, unknown>>(fileName: string, rows: T[]) => {
    downloadTextFile(fileName, toCsv(rows))
  }

  return { exportRows }
}
