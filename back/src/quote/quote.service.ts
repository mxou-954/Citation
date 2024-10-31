import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuoteData } from 'src/entity/quote/quote.entity';
import { InscriptionUser } from 'src/entity/inscription/inscription.entity';
import { ProfileData } from 'src/entity/profile/profile.entity';
import { privateDecrypt } from 'crypto';

@Injectable()
export class QuoteService {
  constructor(
    @InjectRepository(QuoteData)
    private quoteDataRepository: Repository<QuoteData>,

    @InjectRepository(ProfileData)
    private profileDataRepository: Repository<ProfileData>,

    @InjectRepository(InscriptionUser)
    private inscriptionUserRepository: Repository<InscriptionUser>,
  ) {}

  async saveNewQuote(
    userId: number,
    userData: {
      quote: string;
      author: string;
      date: Date;
    },
  ): Promise<QuoteData> {
    console.log('User ID:', userId); // Log pour vérifier l'ID de l'utilisateur

    // Récupérer l'utilisateur et son profil
    const user = await this.inscriptionUserRepository.findOne({
      where: { id: userId },
      relations: ['profile'], // Charger la relation avec le profil
    });

    if (!user) {
      console.error('User not found');
      throw new Error('User not found');
    }

    if (!user.profile) {
      console.error('Profile not found for user:', user.id);
      throw new Error('Profile not found for user');
    }

    console.log('Profile found:', user.profile);

    // Créer la nouvelle citation
    const newQuote = new QuoteData();
    newQuote.quote = userData.quote;
    newQuote.author = userData.author;
    newQuote.date = userData.date;
    newQuote.profile = user.profile; // Associer la citation au profil

    // Sauvegarder la citation
    return this.quoteDataRepository.save(newQuote);
  }

  async getQuotesByProfile(userId: number): Promise<QuoteData[]> {
    const user = await this.inscriptionUserRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'profile.quotes'], // Charger le profil et les citations
    });

    if (!user || !user.profile) {
      throw new Error('User or profile not found');
    }

    return user.profile.quotes;
  }

  async getAllQuotes(): Promise<QuoteData[]> {
    const quotes = this.quoteDataRepository.find();
    return quotes;
  }

  async deleteQuoteById(id: string): Promise<void> {
    const result = await this.quoteDataRepository.delete(id);

    if (result.affected === 0) {
      throw new Error('Citation non trouvée ou déjà supprimée.');
    }
  }

  async findOneById(id: number): Promise<QuoteData> {
    const quote = await this.quoteDataRepository.findOne({ where: { id } });
    if (!quote) {
      throw new Error('Citation non trouvée');
    }
    return quote;
  }

  async getThisQuote(id: number): Promise<QuoteData> {
    const quote = await this.quoteDataRepository.findOne({ where: { id } });
    if (!quote) {
      throw new Error('Citation non trouvée');
    }
    return quote;
  }

  async toggleLike(userId: number, quoteId: number): Promise<QuoteData> {
    const user = await this.inscriptionUserRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
  
    if (!user || !user.profile) {
      throw new UnauthorizedException('Utilisateur ou profil introuvable');
    }
  
    const quote = await this.quoteDataRepository.findOne({
      where: { id: quoteId },
    });
    if (!quote) {
      throw new BadRequestException('La citation est introuvable');
    }
  
    const profile = user.profile;
  
    // Nettoyage des valeurs dans `quoteLikeIDs`
    profile.quoteLikeIDs = Array.from(
      new Set(
        profile.quoteLikeIDs
          .map((id) => Number(id)) // Convertir en nombre
          .filter((id) => !isNaN(id)), // Supprimer les NaN
      ),
    );
  
    const hasLiked = profile.quoteLikeIDs.includes(quoteId);
  
    if (hasLiked) {
      quote.like = Math.max(0, quote.like - 1);
      profile.quoteLikeIDs = profile.quoteLikeIDs.filter(
        (id) => id !== quoteId,
      );
    } else {
      quote.like += 1;
      profile.quoteLikeIDs.push(quoteId);
    }
  
    console.log('Updated quoteLikeIDs after toggle:', profile.quoteLikeIDs);
  
    await this.profileDataRepository.save(profile);
    await this.quoteDataRepository.save(quote);
  
    return quote;
  }

  async getLikes(quoteId: number): Promise<number> {
    const quote = await this.quoteDataRepository.findOne({
      where: { id: quoteId },
    });
    if (!quote) {
      throw new BadRequestException('Citation introuvable');
    }
    return quote.like;
  }

  async getLikedQuoteIds(userId: number): Promise<number[]> {
    const profile = await this.profileDataRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new BadRequestException('Profil introuvable');
    }

    console.log(
      `User ${userId} - Initial liked quotes loaded:`,
      profile.quoteLikeIDs,
    );

    return profile.quoteLikeIDs;
  }
}
