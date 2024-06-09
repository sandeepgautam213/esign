// src/infrastructure/controllers/pdf.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { CreatePDFUseCase } from '../../application/use-cases/create-pdf.usecase';
import { PDF } from '../../domain/modals/pdf.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZohoESignService } from '../services/zoho-esign.service';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as multer from 'multer';
import * as fs from 'fs';



@Controller('pdf')
export class PDFController {
  constructor(
    private readonly createPDFUseCase: CreatePDFUseCase,
    private readonly zohoESignService: ZohoESignService,
  ) { }

  @Post()
  async create(@Body() pdfData: any): Promise<PDF> {
    const pdf = new PDF(null, pdfData.path, pdfData.status);
    return await this.createPDFUseCase.execute(pdf);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PDF> {
    return await this.createPDFUseCase.execute(new PDF(id, '', ''));
  }

  @Post('/sendForSignature')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async sendForSignature(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ): Promise<void> {
    if (!file) {
      res.status(400).send('No file uploaded.');
      return;
    }

    const actionsJson = {
      recipient_name: '<Recipient-Name>',
      recipient_email: '<Recipient-Email>',
      action_type: 'SIGN',
      private_notes: 'Please get back to us for further queries',
      signing_order: 0,
      verify_recipient: true,
      verification_type: 'EMAIL',
    };

    const documentJson = {
      request_name: '<Request-Name>',
      expiration_days: 1,
      is_sequential: true,
      email_reminders: true,
      reminder_period: 8,
      actions: [actionsJson],
    };

    const data = { requests: documentJson };

    const payload = new FormData();
    const filePath = file.path;

    if (!fs.existsSync(filePath)) {
      res.status(500).send('Unable to read file');
      return;
    }

    payload.append('file', fs.createReadStream(filePath));
    payload.append('data', JSON.stringify(data));

    const HEADERS = {
      Authorization: 'Zoho-oauthtoken <Oauth-Token>',
    };

    try {
      const response = await fetch('https://sign.zoho.com/api/v1/requests', {
        method: 'POST',
        headers: HEADERS,
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const request_id = responseData.request_id;

      const actionsJson1 = {
        action_id: responseData.actions[0].action_id,
        recipient_name: responseData.actions[0].recipient_name,
        recipient_email: responseData.actions[0].recipient_email,
        action_type: responseData.actions[0].action_type,
        fields: [
          {
            document_id: responseData.document_ids[0].document_id,
            field_name: 'TextField',
            field_type_name: 'Textfield',
            field_label: 'Text - 1',
            field_category: 'Textfield',
            abs_width: '200',
            abs_height: '18',
            is_mandatory: true,
            x_coord: '30',
            y_coord: '30',
            page_no: 0,
          },
        ],
      };

      const documentJson1 = { actions: [actionsJson1] };
      const data1 = { requests: documentJson1 };
      const payload1 = new FormData();
      payload1.append('data', JSON.stringify(data1));

      const response1 = await fetch(`https://sign.zoho.com/api/v1/requests/${request_id}/submit`, {
        method: 'POST',
        headers: HEADERS,
        body: payload1,
      });

      if (!response1.ok) {
        throw new Error(`HTTP error! status: ${response1.status}`);
      }

      const responseJson1 = await response1.json();
      res.send(responseJson1);
    } catch (error) {
      const errorResponse = {
        message: 'Call failed to initiate', // Check internet connection or proper DC type
        status: 'failure',
      };
      res.status(500).send(errorResponse);
    }
  }
}
