import { PDF } from '../../domain/modals/pdf.model';

// src/application/interfaces/pdf.repository.interface.ts


export interface PDFRepository {
  save(pdf: PDF): Promise<PDF>;
  findById(id: string): Promise<PDF>;
}
