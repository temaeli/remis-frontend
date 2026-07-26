/**
 * Download a base64-encoded file
 * @param base64Data - Base64 encoded file content
 * @param filename - Name of the file to download
 * @param mimeType - MIME type of the file (e.g., 'application/pdf')
 */
export function downloadFile(base64Data: string, filename: string, mimeType: string): void {
  try {
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    // Create temporary download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error(`Failed to download file: ${filename}`);
  }
}

/**
 * Download a PDF file from base64 content
 * @param base64Data - Base64 encoded PDF content
 * @param filename - Name of the PDF file to download (default: 'download.pdf')
 */
export function downloadPdf(base64Data: string, filename: string = 'download.pdf'): void {
  const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  downloadFile(base64Data, pdfFilename, 'application/pdf');
}

/**
 * Download an Excel file from base64 content
 * @param base64Data - Base64 encoded Excel content
 * @param filename - Name of the Excel file to download (default: 'download.xlsx')
 */
export function downloadXlsx(base64Data: string, filename: string = 'download.xlsx'): void {
  const excelFilename = filename.endsWith('.xlsx')
    ? filename
    : filename.endsWith('.xls')
      ? filename
      : `${filename}.xlsx`;
  downloadFile(
    base64Data,
    excelFilename,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

/**
 * Download a Word document from base64 content
 * @param base64Data - Base64 encoded Word content
 * @param filename - Name of the Word file to download (default: 'download.docx')
 */
export function downloadDocx(base64Data: string, filename: string = 'download.docx'): void {
  const docxFilename = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  downloadFile(
    base64Data,
    docxFilename,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
}
