import { Module } from '@nestjs/common';
import { ConnexionService } from './connexion.service';
import { ConnexionController } from './connexion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InscriptionUser } from 'src/entity/inscription/inscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InscriptionUser])],
  providers: [ConnexionService],
  controllers: [ConnexionController],
})
export class ConnexionModule {}
