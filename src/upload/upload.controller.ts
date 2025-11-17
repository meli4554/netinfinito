import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'

@Controller('upload')
export class UploadController {
  @Post('invoice')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/invoices',
        filename: (req, file, cb) => {
          const invoiceNumber = req.body.invoiceNumber || 'NF'
          const timestamp = Date.now()
          const ext = extname(file.originalname)
          const filename = `${invoiceNumber}_${timestamp}${ext}`
          cb(null, filename)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true)
        } else {
          cb(new Error('Apenas arquivos PDF são permitidos'), false)
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  uploadInvoice(
    @UploadedFile() file: Express.Multer.File,
    @Body('invoiceNumber') invoiceNumber: string,
  ) {
    if (!file) {
      throw new Error('Nenhum arquivo foi enviado')
    }

    return {
      filePath: `/uploads/invoices/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    }
  }
}
