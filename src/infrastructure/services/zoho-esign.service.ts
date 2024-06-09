// src/infrastructure/services/zoho-esign.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ZohoESignService {
  async addESignTag(pdfPath: string): Promise<any> {
    // Use Zoho API to add eSign tag
    const response = await axios.post('ZOHO_ESIGN_API_URL', {
      // API payload
    });
    return response.data;
  }

  async submitForESign(pdfPath: string): Promise<any> {
    // Use Zoho API to submit for eSign
    const response = await axios.post('ZOHO_ESIGN_SUBMIT_URL', {
      // API payload
    });
    return response.data;
  }
}
