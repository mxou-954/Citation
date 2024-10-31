import {
  Controller,
  Post,
  Body,
  Request,
  BadRequestException,
  Get,
  NotFoundException,
  Delete,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { QuoteService } from './quote.service';

@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post('new')
  async new(
    @Request() req,
    @Body()
    userData: {
      quote: string;
      author: string;
      date: Date;
    },
  ) {
    // Vérifie si l'utilisateur est connecté
    if (!req.session.user) {
      throw new UnauthorizedException(
        'Vous devez être connecté pour poster une citation',
      );
    }

    // Appeler le service pour sauvegarder la citation et passer l'ID utilisateur
    const newQuote = await this.quoteService.saveNewQuote(
      req.session.user.id,
      userData,
    );
    if (!newQuote) {
      throw new BadRequestException(
        'Un problème est survenu lors de la création de la citation',
      );
    }

    return {
      success: true,
      message: 'La citation a été créée',
      quote: newQuote,
    };
  }

  @Get('viewAllMy')
  async viewAllMy(@Request() req) {
    if (!req.session.user) {
      throw new UnauthorizedException(
        'Vous devez être connecté pour voir vos citations',
      );
    }

    const quotes = await this.quoteService.getQuotesByProfile(
      req.session.user.id,
    );

    return {
      success: true,
      message: 'Voici les citations :',
      quotes: quotes,
    };
  }

  @Get('viewAll')
  async viewAll(@Request() req) {
    const quotes = await this.quoteService.getAllQuotes();
    if (!quotes) {
      throw new BadRequestException('Erreur : aucune quotes a renvoyer');
    }

    return {
      success: true,
      message: 'Voici les citations :',
      quotes: quotes,
    };
  }

  @Delete(':id') // Le ':id' est un paramètre dynamique dans l'URL
  async deleteQuote(
    @Param('id') id: string, // Récupère l'id depuis l'URL
    @Request() req,
  ) {
    if (!req.session.user) {
      throw new BadRequestException('Utilisateur non authentifié.');
    }

    // Appel au service pour supprimer la citation
    return this.quoteService.deleteQuoteById(id);
  }

  @Get(':id')
  async getQuoteById(@Param('id') id: number) {
    const quote = await this.quoteService.findOneById(id);
    if (!quote) {
      throw new NotFoundException('Citation non trouvée');
    }
    return quote;
  }

  @Get('viewDetail/:id')
  async viewDetail(@Request() req, @Param('id') id: string) {
    const quoteId = Number(id); // Convertir l'ID en nombre
    if (isNaN(quoteId)) {
      throw new BadRequestException('ID non valide');
    }

    const quotes = await this.quoteService.getThisQuote(quoteId); // Utiliser l'ID comme un nombre
    if (!quotes) {
      throw new BadRequestException('Erreur : aucune citation à renvoyer');
    }

    return {
      success: true,
      message: 'Voici la citation :',
      quotes: quotes,
    };
  }

  @Post('like')
  async toggleLike(
    @Request() req,
    @Body('quoteId') quoteId: number,
  ) {
    const user = req.session.user;
    if (!user) {
      throw new UnauthorizedException('Non connecté');
    }
  
    const result = await this.quoteService.toggleLike(user.id, quoteId);
    return {
      success: true,
      message: "",
      quote : result,
    };
  }

  @Get('likes/:id')
  async getLikes(@Param('id') id: number) {
    const likes = await this.quoteService.getLikes(id);
    return { success: true, likes };
  }

  @Get('liked')
  async getLikedQuotes(@Request() req) {
    const user = req.session.user;
    if (!user) {
      throw new UnauthorizedException('Non connecté');
    }
  
    const likedQuoteIds = await this.quoteService.getLikedQuoteIds(user.id);
    return { success: true, likedQuoteIds };
  }
}
