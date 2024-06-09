// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PDFController } from './infrastructure/controllers/pdf.controller';
import { PDFMongoRepository } from './infrastructure/repositories/pdf.repository';
import { PDFDocument, PDFSchema } from './infrastructure/schemas/pdf.schema';
import { ZohoESignService } from './infrastructure/services/zoho-esign.service';
import { CreatePDFUseCase } from './application/use-cases/create-pdf.usecase';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    MongooseModule.forFeature([{ name: PDFDocument.name, schema: PDFSchema }]),
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [PDFController],
  providers: [
    PDFMongoRepository,
    ZohoESignService,
    {
      provide: 'PDFRepository',
      useClass: PDFMongoRepository,
    },
    CreatePDFUseCase,
  ],
})
export class AppModule { }
