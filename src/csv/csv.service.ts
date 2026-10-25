import { Injectable } from '@nestjs/common';
import { Parser } from '@json2csv/plainjs';

@Injectable()
export class CsvService {
  constructor() {}

  generateCsv<T>(items: T[], fields: string[]) {
    try {
      const parser = new Parser({
        fields,
      });
      return parser.parse(items);
    } catch (error) {
      throw new Error('Failed to generate CSV');
    }
  }
}
