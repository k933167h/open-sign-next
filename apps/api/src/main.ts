import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors(); // 로컬 개발을 위해 허용
    app.setGlobalPrefix('api');
    await app.listen(3000);
}
bootstrap();