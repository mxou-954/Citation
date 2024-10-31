import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001', // L'origine autorisée (ton front-end React)
    credentials: true, // Si tu veux autoriser les cookies/sessions
  });


  app.use(
    session({
      secret: 'my-secret-key',  // Remplace par une clé sécurisée
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 },  // Durée de la session (1 heure ici)
    }),
  );
  
  await app.listen(3000);
}
bootstrap();
