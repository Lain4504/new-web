import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LivekitModule } from './modules/livekit/livekit.module';
import { TldrawModule } from './modules/tldraw/tldraw.module';
import { RecordingModule } from './modules/recording/recording.module';
import { WebhookModule } from './modules/webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LivekitModule,
    TldrawModule,
    RecordingModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
