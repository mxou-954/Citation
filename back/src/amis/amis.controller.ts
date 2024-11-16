import {
  BadRequestException,
  Controller,
  Post,
  Get,
  Body,
  Request,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AmisService } from './amis.service';

@Controller('amis')
export class AmisController {
  constructor(private readonly amisService: AmisService) {}

  @Post('/add-friend')
  async addFriend(
    @Body() body: { searchTerm: string },
    @Request() req,
  ) {
    console.log("Requête reçue pour ajouter un ami avec le terme de recherche :", body.searchTerm);
    console.log("Données de session utilisateur :", req.session.user);

    if (!req.session.user || !req.session.user.id) {
      throw new UnauthorizedException("L'utilisateur doit être connecté !");
    }

    if (!req.session.user.profile || !req.session.user.profile.id) {
      throw new BadRequestException("Profil utilisateur introuvable dans la session.");
    }

    const { searchTerm } = body;

    if (!searchTerm) {
      throw new BadRequestException("Le terme de recherche est requis.");
    }

    const friendProfile = await this.amisService.findFriendProfile(searchTerm);
    if (!friendProfile) {
      throw new BadRequestException("Ami introuvable !");
    }

    const friendship = await this.amisService.requestFriendship(
      req.session.user.profile.id,
      friendProfile,
    );

    return {
      success: true,
      message: "Demande d'amitié envoyée",
      amis: friendship,
    };
  }

  @Get('/sent-requests')
  async getSentRequests(@Request() req) {
    if (!req.session.user || !req.session.user.id) {
      throw new UnauthorizedException("L'utilisateur doit être connecté !");
    }

    return await this.amisService.getSentFriendRequests(req.session.user.id);
  }

  // Obtenir les demandes d'amis reçues
  @Get('/received-requests')
  async getReceivedRequests(@Request() req) {
    if (!req.session.user || !req.session.user.id) {
      throw new UnauthorizedException("L'utilisateur doit être connecté !");
    }

    return await this.amisService.getReceivedFriendRequests(req.session.user.id);
  }

  // Accepter ou refuser une demande d'amitié
  @Post('/update-status')
  async updateFriendRequestStatus(
    @Body() body: { requestId: number; status: 'accepted' | 'rejected' },
  ) {
    const { requestId, status } = body;
    if (!['accepted', 'rejected'].includes(status)) {
      throw new BadRequestException("Statut invalide.");
    }

    return await this.amisService.updateFriendRequestStatus(requestId, status as 'accepted' | 'rejected');
  }
}

