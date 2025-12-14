import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TldrawGateway } from './modules/tldraw/tldraw.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Get HTTP server instance and initialize WebSocket
  const httpServer = app.getHttpServer();
  const tldrawGateway = app.get(TldrawGateway);
  tldrawGateway.initializeWebSocket(httpServer);

  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`🔌 WebSocket available at ws://localhost:${port}/tldraw/connect/:roomId`);
}
bootstrap();
