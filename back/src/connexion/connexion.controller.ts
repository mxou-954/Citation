import {
  Controller,
  Post,
  Body,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ConnexionService } from './connexion.service';
import { triggerAsyncId } from 'async_hooks';

@Controller('connexion')
export class ConnexionController {
  constructor(private readonly connexionService: ConnexionService) {}

  @Post('connect')
  async Connexion(
    @Request() req,
    @Body() userData: { email: string; password: string },
  ) {
    const user = await this.connexionService.findUserByEmail(userData.email);
    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé !');
    }

    const isPasswordValid = await this.connexionService.validationPassword(
      userData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe incorrect');
    }

    // Stocker l'utilisateur dans la session
    if (req.session) {
      req.session.user = {
        id: user.id,
        email: user.email,
      };
    } else {
      throw new Error('Session non initialisée');
    }

    return {
      success: true,
      message: 'Utilisateur connecté',
      user: req.session.user,
    };
  }
}
