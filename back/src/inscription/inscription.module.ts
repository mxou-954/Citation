import { Module } from '@nestjs/common';
import { InscriptionController } from './inscription.controller';
import { InscriptionService } from './inscription.service';
import { InscriptionUser } from '../entity/inscription/inscription.entity';
import { ProfileData } from '../entity/profile/profile.entity'; // Import de l'entité ProfileData
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([InscriptionUser, ProfileData])], // Ajouter ProfileData
  controllers: [InscriptionController],
  providers: [InscriptionService],
})
export class InscriptionModule {}