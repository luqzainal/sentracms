import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
    internal: {
      pageSize: {
        width: number;
        height: number;
        getWidth: () => number;
        getHeight: () => number;
      };
      scaleFactor: number;
      events: unknown;
      pages: number[];
      getEncryptor(objectId: number): (data: string) => string;
      getNumberOfPages(): number;
    };
  }
}

declare module 'jspdf-autotable' {
  interface UserOptions {
    head?: (string | number | boolean)[][];
    body?: (string | number | boolean)[][];
    startY?: number;
    theme?: 'striped' | 'grid' | 'plain';
    styles?: {
      fontSize?: number;
      cellPadding?: number;
      textColor?: number | number[];
      fillColor?: number | number[];
      fontStyle?: 'normal' | 'bold' | 'italic';
    };
    headStyles?: {
      fontSize?: number;
      cellPadding?: number;
      textColor?: number | number[];
      fillColor?: number | number[];
      fontStyle?: 'normal' | 'bold' | 'italic';
    };
    alternateRowStyles?: {
      fillColor?: number | number[];
    };
    margin?: {
      left?: number;
      right?: number;
      top?: number;
      bottom?: number;
    };
    columnStyles?: {
      [key: number]: {
        cellWidth?: number;
        fontSize?: number;
        textColor?: number | number[];
        fillColor?: number | number[];
      };
    };
  }

  function autoTable(doc: jsPDF, options: UserOptions): void;
  export default autoTable;
} 