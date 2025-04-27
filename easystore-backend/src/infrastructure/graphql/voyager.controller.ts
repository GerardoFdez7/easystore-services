import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import voyagerMiddleware from 'graphql-voyager/middleware/express';

@Controller('voyager')
export class VoyagerController {
  @Get()
  voyager(@Req() req: Request, @Res() res: Response): void {
    const handler = voyagerMiddleware({
      endpointUrl: '/graphql',
      displayOptions: {
        sortByAlphabet: true,
        hideRoot: false,
      },
    });
    handler(req, res);
  }
}
