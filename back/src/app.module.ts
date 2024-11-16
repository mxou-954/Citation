import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscriptionModule } from './inscription/inscription.module';
import { ConnexionModule } from './connexion/connexion.module';
import { SessionController } from './session/session.controller';
import { ProfileModule } from './profile/profile.module';
import { QuoteModule } from './quote/quote.module';
import { CommentModule } from './comment/comment.module';
import { AmisModule } from './amis/amis.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'mydatabase',
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Assurez-vous que les entités sont au bon endroit
      synchronize: true, // Mettez false en production si nécessaire
      logging: true,
    }),
    InscriptionModule,
    ConnexionModule,
    ProfileModule,
    QuoteModule,
    CommentModule,
    AmisModule,
  ],
  controllers: [SessionController],  
})
export class AppModule {}
