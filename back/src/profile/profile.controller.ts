import {
  BadRequestException,
  Controller,
  Get,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { throws } from 'assert';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('countLikes')
  async getLikeCount(@Request() req) {
    const userId = req.session.user.id;
    if (!userId) {
      throw new UnauthorizedException("L'utilisateur n'est pas connecté !");
    }

    const likeNumber = await this.profileService.getLikesNumber(userId);
    if (likeNumber === undefined) {
      throw new BadRequestException('Une erreur est survenue');
    }

    return {
      success: true,
      message: 'Nombre de likes :',
      likes: likeNumber,
    };
  }

  @Get('countComments')
  async countComments(@Request() req) {
    const user = req.session.user.id;
    if (!user) {
      throw new UnauthorizedException("L'utilisateur n'est pas connecté");
    }

    const numberComments = await this.profileService.getNumberOfComments(user);
    if (!numberComments) {
      throw new BadRequestException(
        'Une erreur est survenu lors de la recherche dans le service',
      );
    }

    return {
      success: true,
      message: 'Comments :',
      comments: numberComments,
    };
  }
}
