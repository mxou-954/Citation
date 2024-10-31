import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { QuoteData } from 'src/entity/quote/quote.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileData } from 'src/entity/profile/profile.entity'; // Import du profil
import { InscriptionUser } from 'src/entity/inscription/inscription.entity'; // Import de l'utilisateur

@Module({
  imports: [TypeOrmModule.forFeature([QuoteData, ProfileData, InscriptionUser])], // Ajouter les entités manquantes
  providers: [QuoteService],
  controllers: [QuoteController],
})
export class QuoteModule {}