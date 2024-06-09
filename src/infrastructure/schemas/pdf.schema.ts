// src/infrastructure/schemas/pdf.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PDFDocument extends Document {
  @Prop()
  path: string;

  @Prop()
  status: string;
}

export const PDFSchema = SchemaFactory.createForClass(PDFDocument);
