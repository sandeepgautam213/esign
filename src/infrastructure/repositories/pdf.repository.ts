// src/infrastructure/repositories/pdf.repository.ts
import { PDFRepository } from '../../application/interfaces/pdf.repository.interface';
import { PDF } from '../../domain/modals/pdf.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PDFDocument, PDFSchema } from '../schemas/pdf.schema';

@Injectable()
export class PDFMongoRepository implements PDFRepository {
  constructor(@InjectModel(PDFDocument.name) private pdfModel: Model<PDFDocument>) { }

  async save(pdf: PDF): Promise<PDF> {
    const createdPDF = new this.pdfModel(pdf);
    return createdPDF.save();
  }

  async findById(id: string): Promise<PDF> {
    return this.pdfModel.findById(id).exec() as PDF;
  }
}
