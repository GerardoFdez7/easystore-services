import { Module, Global } from '@nestjs/common';
import { SessionModule } from './session/session.module';

@Global()
@Module({
  imports: [SessionModule],
  exports: [SessionModule],
})
export class AuthModule {}
