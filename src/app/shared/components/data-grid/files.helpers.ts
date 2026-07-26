import { Worksheet } from 'exceljs';
import { GridKeyColumn } from './data-grid.interfaces';

export function buildExportColumnsFromKeyColumns(keyColumns: GridKeyColumn[], columns: any[]) {
  const result: any[] = [];

  keyColumns.forEach((col) => {
    if (typeof col === 'string') {
      const parsed = parseColumnString(col);
      result.push({
        field: parsed.field,
        header: parsed.header,
        type: parsed.type,
        ...columns.find((c) => c.field === parsed.field),
      });

      return;
    }

    const parent = parseColumnString(col.field);
    const children = col.keyColumns ?? [];

    children.forEach((child) => {
      const field = `${parent.field}.${child}`;

      result.push({
        field,
        header: child,
        group: parent.header,
        type: parent.type,
        ...columns.find((c) => c.field === field),
      });
    });
  });

  return result.filter((c) => !c.hide);
}

export function parseColumnString(value: string) {
  const [rawField, rawHeader] = value.split(/\s+as\s+/i);
  const typeMatch = value.match(/type\((.*?)\)/i);

  const field = rawField.trim();
  const header = (rawHeader ?? rawField).replace(/type\(.*?\)/gi, '').trim();

  return {
    field,
    header,
    type: typeMatch?.[1],
  };
}

export function writeNestedHeaders(
  worksheet: Worksheet,
  columns: any[],
  border: any,
  headerFill: any,
  startRow = 1,
) {
  const topRow = startRow;
  const bottomRow = startRow + 1;

  let colIndex = 1;

  while (colIndex <= columns.length) {
    const col = columns[colIndex - 1];

    const topCell = worksheet.getCell(topRow, colIndex);

    if (!col.group) {
      topCell.value = col.header;
      worksheet.mergeCells(topRow, colIndex, bottomRow, colIndex);
      styleMergedRange(worksheet, topRow, colIndex, bottomRow, colIndex, border, headerFill, true);
      colIndex++;
      continue;
    }

    const group = col.group;
    let endColIndex = colIndex;

    while (endColIndex <= columns.length && columns[endColIndex - 1]?.group === group) {
      endColIndex++;
    }

    topCell.value = group;
    worksheet.mergeCells(topRow, colIndex, topRow, endColIndex - 1);
    styleMergedRange(worksheet, topRow, colIndex, topRow, endColIndex - 1, border, headerFill, true);

    for (let i = colIndex; i < endColIndex; i++) {
      const childCell = worksheet.getCell(bottomRow, i);
      childCell.value = columns[i - 1].header;
      childCell.border = border;
      childCell.fill = headerFill;
      childCell.font = { bold: true };
      childCell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
    }

    colIndex = endColIndex;
  }
}

export function applyBodyMerges({
  worksheet,
  item,
  rowIndex,
  visibleColumns,
  border,
}: {
  worksheet: Worksheet;
  item: any;
  rowIndex: number;
  visibleColumns: any[];
  border: any;
}) {
  const cellsProps = item?.cellsProps ?? {};

  visibleColumns.forEach((col, index) => {
    const prop = cellsProps[col.field];
    if (!prop) return;

    const colspan = Number(prop.colspan ?? 1);
    const rowspan = Number(prop.rowspan ?? 1);

    if (colspan <= 1 && rowspan <= 1) return;

    const startCol = index + 1;
    const endCol = startCol + colspan - 1;
    const endRow = rowIndex + rowspan - 1;

    worksheet.mergeCells(rowIndex, startCol, endRow, endCol);

    styleMergedRange(worksheet, rowIndex, startCol, endRow, endCol, border, undefined, false);
  });
}

export function styleMergedRange(
  worksheet: Worksheet,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  border: any,
  fill?: any,
  bold = false,
) {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const cell = worksheet.getCell(r, c);
      cell.border = border;

      if (fill) cell.fill = fill;
      if (bold) cell.font = { bold: true };

      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
    }
  }
}

export function styleRow(row: any, border: any, fill: any, bold = false) {
  row.eachCell((cell: any) => {
    cell.border = border;
    cell.fill = fill;
    cell.font = { bold };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
  });
}

export function normalizeExcelValue(value: any, undefinedValue = '') {
  if (value === undefined || value === null) return undefinedValue;

  if (typeof value === 'boolean') return value ? 'YES' : 'NO';

  if (typeof value === 'object') {
    return value?.name ?? value?.label ?? value?.title ?? JSON.stringify(value);
  }

  return value;
}
