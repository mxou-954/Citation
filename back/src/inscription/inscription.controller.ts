import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Request,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InscriptionService } from './inscription.service';
import session from 'express-session';

@Controller('inscription')
export class InscriptionController {
  constructor(private readonly inscriptionService: InscriptionService) {}

  @Post('new')
  async new(
    @Request() req,
    @Body()
    userData: {
      nom: string;
      email: string;
      password: string;
      confirmPassword: string;
    },
  ) {
    // Vérifier si l'utilisateur existe déjà
    const isUserFind = await this.inscriptionService.findUserByEmail(
      userData.email,
    );

    if (isUserFind) {
      throw new BadRequestException('Utilisateur déjà dans le système');
    }

    // Vérifier si les mots de passe concordent et hacher le mot de passe
    const newUser =
      await this.inscriptionService.checkPasswordAndCrypt(userData);

    if (!newUser) {
      throw new BadRequestException('Les mots de passe ne concordent pas');
    }

    // Retourner une réponse avec succès et l'utilisateur créé
    return {
      success: true,
      message: 'Utilisateur créé avec succès',
      utilisateur: newUser,
    };
  }

  @Get('name')
  async name(@Request() req) {
    if (!req.session.user) {
      throw new UnauthorizedException(
        'Vous devez être connecté pour accéder à cette page',
      );
    }

    const name = await this.inscriptionService.findName(req.session.user.id);
    if (!name) {
      throw new BadRequestException('Utilisateur non trouvé !! ');
    }

    return {
      success: true,
      message: "Nom de l'utilisateur : ",
      name: name,
    };
  }

  @Put('modificationName')
  async modificationName(@Request() req, @Body() body: { newName: string }) {
    if (!req.session.user) {
      throw new BadRequestException('Utilisateur non trouvé !!');
    }
  
    const updatedUser = await this.inscriptionService.changeName(req.session.user.id, body.newName);
  
    return {
      success: true,
      message: 'Nom modifié avec succès',
      user: updatedUser,
    };
  }
}
