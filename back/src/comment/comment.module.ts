import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { QuoteData } from 'src/entity/quote/quote.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileData } from 'src/entity/profile/profile.entity'; // Import du profil
import { InscriptionUser } from 'src/entity/inscription/inscription.entity'; // Import de l'utilisateur
import { CommentData } from 'src/entity/comments/comments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentData, QuoteData, ProfileData, InscriptionUser])
  ],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}