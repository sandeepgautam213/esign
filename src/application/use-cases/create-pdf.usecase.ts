import { PDFRepository } from '../interfaces/pdf.repository.interface';
import { PDF } from '../../domain/modals/pdf.model';

export class CreatePDFUseCase {
  constructor(private readonly pdfRepository: PDFRepository) { }

  async execute(pdf: PDF): Promise<PDF> {
    return await this.pdfRepository.save(pdf);
  }
}