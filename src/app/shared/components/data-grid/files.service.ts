import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Column, Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

import { jsPDF } from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import { getPathValue, inParensAfter } from '../details/util/field/fields.helper';
import {
  applyBodyMerges,
  buildExportColumnsFromKeyColumns,
  normalizeExcelValue,
  styleMergedRange,
  styleRow,
  writeNestedHeaders,
} from './files.helpers';
import { isValue, formatIfDate, replaceLast, truncate } from '@core/helpers';
import { NotificationService } from '@shared/services/notification.service';

export interface ReadExcelProps {
  skipHeader?: boolean;
  filteredColumns?: string[];
  hasMergedColumns?: boolean;
  firstHeaderCol?: string;
}

export type ExcelColumn_ = string | ExcelColumn;

export interface PaperOptions {
  orientation: 'l' | 'p' | 'portrait' | 'landscape';
  unit: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc';
  size: 'a5' | 'a4' | 'a3' | 'a2';
}

type GridKeyColumn =
  | string
  | {
      field: string;
      keyColumns?: string[];
    };

interface ExportGridExcelOptions {
  data: any[];
  keyColumns: GridKeyColumn[];
  columns?: any[];
  fileName?: string;
  sheetName?: string;
  undefinedValue?: string;
  /** Rendered as a merged row above the headers, spanning all visible columns. */
  title?: string;
}

/** System primary color (--color-primary: #136148), used for export headers/titles instead of the old ad-hoc blue. */
const PRIMARY_ARGB = '136148';
const PRIMARY_RGB: [number, number, number] = [19, 97, 72];

export interface ExcelColumn {
  key?: string;
  index?: number;
  type?: 'gender' | 'number' | 'date' | 'email' | 'string' | 'boolean' | 'phone';
  allowedValues?: string[];
  valueMapper?: (v: any) => any;
  format?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  constructor(
    public dialog: MatDialog,
    private notify: NotificationService,
  ) {}

  downloadPDF(
    format: string | 'pdf',
    fileName: string | 'file.pdf',
    base64: string,
    dataFormat: string | 'application/pdf',
  ) {
    const linkSource = 'data:' + dataFormat + ';base64,' + base64;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  b64toBlob(b64Data: string, contentType: string, sliceSize = 512) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return URL.createObjectURL(blob);
  }

  // USAGE
  //
  // this.settings.exportExcel(
  //   this.canditates,
  //   this.columns,
  //   this.filename,
  //   this.sheetName
  // );

  // columns = [
  //   { header: 'S/N', key: 'id', width: 5 },
  //   { header: 'Full Name', key: 'fullname', width: 45 },
  // ];

  async exportGridExcel({
    data,
    keyColumns,
    columns = [],
    fileName = 'Report',
    sheetName = 'data',
    undefinedValue = '',
    title,
  }: ExportGridExcelOptions) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    const border = {
      top: { style: 'thin' as const },
      left: { style: 'thin' as const },
      bottom: { style: 'thin' as const },
      right: { style: 'thin' as const },
    };

    const headerFill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'EBEBEB' },
    };

    const titleFill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: PRIMARY_ARGB },
    };

    const visibleColumns = buildExportColumnsFromKeyColumns(keyColumns, columns);

    worksheet.columns = visibleColumns.map((c) => ({
      key: c.field,
      width: c.width ?? Math.max(12, String(c.header ?? c.field).length + 4),
    }));

    const hasNestedHeaders = visibleColumns.some((c) => c.group);
    const headerStartRow = title ? 2 : 1;

    if (title && visibleColumns.length) {
      const titleRow = worksheet.getRow(1);
      titleRow.getCell(1).value = title;
      worksheet.mergeCells(1, 1, 1, visibleColumns.length);
      styleMergedRange(worksheet, 1, 1, 1, visibleColumns.length, border, titleFill, true);
      titleRow.getCell(1).font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
      titleRow.height = 22;
    }

    if (hasNestedHeaders) {
      writeNestedHeaders(worksheet, visibleColumns, border, headerFill, headerStartRow);
    } else {
      const headerRow = worksheet.getRow(headerStartRow);
      visibleColumns.forEach((c, colIndex) => (headerRow.getCell(colIndex + 1).value = c.header));
      styleRow(headerRow, border, headerFill, true);
    }

    const startRow = headerStartRow + (hasNestedHeaders ? 2 : 1);

    data.forEach((item, rowIndex) => {
      const excelRowIndex = startRow + rowIndex;

      visibleColumns.forEach((col, colIndex) => {
        const excelColIndex = colIndex + 1;
        const cell = worksheet.getCell(excelRowIndex, excelColIndex);

        cell.value = normalizeExcelValue(getPathValue(item, col.field), undefinedValue);
        cell.border = border;
        cell.alignment = {
          vertical: 'middle',
          horizontal: col.align ?? 'left',
          wrapText: true,
        };
      });

      applyBodyMerges({
        worksheet,
        item,
        rowIndex: excelRowIndex,
        visibleColumns,
        border,
      });
    });

    worksheet.views = [{ state: 'frozen', ySplit: headerStartRow + (hasNestedHeaders ? 1 : 0) }];

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = border;
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    saveAs(new Blob([buffer], { type }), `${fileName}.xlsx`);

    return true;
  }

  async exportExcel(data: any[], columns: Column[], fileName = 'Report', sheetName = 'data') {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = columns;
    data.forEach((e) => worksheet.addRow(e, 'n'));

    data.forEach((row, index) => {
      if (index % 2 == 0) return;
      worksheet.getRow(index + 2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'f2f2f2' },
      };
    });

    // font
    worksheet.getRow(1).font = {
      name: 'calibri',
      size: 12,
      bold: true,
      color: { argb: '27445c' },
    };

    // fill
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ebebeb' },
    };

    //border
    worksheet.getRow(1).border = {
      bottom: { style: 'thick', color: { argb: '0183DB' } },
    };

    worksheet.getRow(1).alignment = { horizontal: 'left' };

    await workbook.xlsx.writeBuffer().then((data: BlobPart) => {
      const type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = new Blob([data], { type });
      saveAs(blob, fileName + '.xlsx');
    });

    return true;
  }

  readExcel(file: any, columns_: ExcelColumn_[], props?: ReadExcelProps): Promise<any[]> {
    const colProps = ['type', 'allowedValues', 'index', 'format'];

    // parse columns
    const columns: ExcelColumn[] = columns_.map((col) => {
      let column: ExcelColumn = col as any;

      if (typeof col === 'string') {
        column = {
          key: col.split(' ')[0],
          ...colProps.reduce((p, v) => ({ ...p, [v]: inParensAfter(col, v) }), {}),
        };
      }

      return column;
    });

    const columnsKeys: any = columns.map((c) => c.key);

    if (!file) return Promise.resolve([]);

    if (file.name?.split('.').slice(-1)[0] !== 'xlsx') {
      this.notify.error('Only .xlsx file allowed');
      return Promise.resolve([]);
    }

    const workbook = new Workbook();
    const arryBuffer = new Response(file).arrayBuffer();
    let buffer: any[] = [];

    return arryBuffer.then(function (data) {
      return workbook.xlsx.load(data).then(async function () {
        buffer = [];
        let indexMap: any = undefined;
        const worksheet = workbook.getWorksheet(1);

        const getIndexMap = (obj: any) => {
          const useDefaultMap = props?.hasMergedColumns !== true;
          if (useDefaultMap)
            return columnsKeys.reduce((p: any, k: any, i: any) => ({ ...p, [k]: i }), {});

          const result: any = {};
          let index = 0;
          let previousValue = null;

          for (const key of Object.keys(obj)) {
            if (obj[key] === previousValue) index += 1; // If the current value is the same as the previous value, shift the index
            result[key] = index;
            previousValue = obj[key];
            index += 1; // Increment index for the next key
          }

          return result;
        };

        // add more interpretation of excel cel values
        const getValue = (value: any) => {
          if (['string', 'number', 'boolean'].includes(typeof value)) return value;
          if (typeof value === 'object' && value.hasOwnProperty('text')) return value.text;
          return value;
        };

        worksheet?.eachRow(function (sheetRow: any, rowNumber: any) {
          const row = [...(sheetRow.values as any)];
          row.shift(); //first col is the excel index skip it

          const field: any = {}; //set field
          const getKeyValue = (k: any, i: any) => getValue(row?.[indexMap ? (indexMap[k] ?? i) : i]);
          columnsKeys.forEach((k: any, i: any) => !!row?.[i] && (field[k] = getKeyValue(k, i)));

          if (field?.[columnsKeys[0]]) buffer.push(field); //push to buffer
          if (!indexMap && buffer.length) indexMap = getIndexMap(buffer?.[0]); // use header to build index map;
          return buffer;
        });

        if (props?.skipHeader !== false) {
          buffer.shift(); //first row is the header skip it

          const skipHeader = () => {
            const defaults = ['s/n', 'no', 'sno', '#'];
            const firstHeaderCol = props?.firstHeaderCol ? [props.firstHeaderCol] : defaults;
            const firstRowColVal = new String(buffer[0]?.[columnsKeys[0]])?.toLowerCase()?.trim();

            if (firstHeaderCol.includes(firstRowColVal)) {
              buffer.shift();
              skipHeader();
            } else return;
          };

          skipHeader();
        }

        // funny _ on email instead of @
        const isEmail = (c: ExcelColumn) => c.type === 'email' || c.key?.includes('email');
        const mailsKeys = columns.filter(isEmail).map((c) => c.key);
        const parseEmail = (r: any, k: any) =>
          !r[k].includes('@') && (r[k] = replaceLast(r[k], '_', '@'));
        mailsKeys.forEach((k: any) => buffer.forEach((r) => !!r[k] && parseEmail(r, k)));

        // numbers
        const numsKeys = columns.filter((c) => c.type === 'number').map((c) => c.key);
        const parseNumber = (r: any, k: any) => isValue(r[k]) && (r[k] = parseInt(r[k]));
        numsKeys.forEach((k) => buffer.forEach((r) => parseNumber(r, k)));

        // mapped cols
        const mapedCols = columns.filter((c) => !!c.valueMapper);
        const mapValue = (r: any, c: ExcelColumn, k: any) =>
          isValue(r[k]) && (r[k] = c.valueMapper?.(r[k]));
        mapedCols.forEach((c) => buffer.forEach((r) => mapValue(r, c, c.key)));

        //phone
        const phoneKeys = columns.filter((c) => c.type === 'phone').map((c) => c.key);
        const parsePhone = (r: any, k: any) =>
          !new String(r[k]).startsWith('0') && (r[k] = `0${r[k]}`);
        phoneKeys.forEach((k: any) => buffer.forEach((r) => !!r[k] && parsePhone(r, k)));

        //date
        const dateCols = columns.filter((c) => c.type === 'date');
        const parsedate = (r: any, c: ExcelColumn, k: any) => (r[k] = formatIfDate(r[k], c.format));
        dateCols.forEach((c: any) => buffer.forEach((r) => !!r[c.key] && parsedate(r, c, c.key)));

        // delete filteredColumns
        const deleteKey = (field: any, k: any) => field.hasOwnProperty(k) && delete field[k];
        props?.filteredColumns?.forEach((k) => buffer.forEach((field) => deleteKey(field, k)));

        return buffer;
      });
    });
  }

  exportListToPDF(
    list: any[],
    title = 'My Data Export',
    fileName = 'export',
    paperOptions?: PaperOptions,
    tableOptions?: UserOptions,
  ) {
    const doc = new jsPDF(
      paperOptions?.orientation ?? 'portrait',
      paperOptions?.unit ?? 'pt',
      paperOptions?.size ?? 'a4',
    );

    // Add title
    const margin = 25;
    title = truncate(title, 60);

    doc.setTextColor(...PRIMARY_RGB);
    doc.text(title, margin, margin + margin / 2); // add the title

    const userOptions: UserOptions = {
      startY: margin * 2,
      head: [Object.keys(list[0])],
      body: list.map((item) => Object.values(item)),

      theme: 'grid',
      // tableWidth: 'wrap',
      pageBreak: 'auto',

      headStyles: { fillColor: PRIMARY_RGB, textColor: [255, 255, 255] },

      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak', // Handle long text
      },

      columnStyles: {
        0: { cellWidth: 'auto' }, // Auto width for first column
        1: { cellWidth: 'auto' }, // Auto width for second column
        all: { cellWidth: 'wrap' }, // For all columns
      },

      margin: { left: margin, right: margin }, // Reduce side margins,

      ...tableOptions,
    };

    autoTable(doc, userOptions);
    doc.save(fileName + '.pdf'); // Save the PDF
  }
}
