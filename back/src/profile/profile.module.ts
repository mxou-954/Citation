import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileData } from 'src/entity/profile/profile.entity';
import { InscriptionUser } from 'src/entity/inscription/inscription.entity'; // Import de l'entité InscriptionUser
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileData, InscriptionUser])], // Import des deux entités
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}