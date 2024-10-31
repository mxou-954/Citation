import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileData } from 'src/entity/profile/profile.entity';
import { error } from 'console';
import { InscriptionUser } from 'src/entity/inscription/inscription.entity';
import { RelationCountAttribute } from 'typeorm/query-builder/relation-count/RelationCountAttribute';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(ProfileData)
    private profileDataRepository: Repository<ProfileData>,

    @InjectRepository(InscriptionUser)
    private inscriptionUserRepository: Repository<InscriptionUser>,
  ) {}

  async getLikesNumber(userId: number): Promise<number> {
    const user = await this.inscriptionUserRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
  
    if (!user || !user.profile) {
      throw new UnauthorizedException("Utilisateur ou profil introuvable");
    }
  
    return user.profile.quoteLikeIDs.length;
  }

  async getNumberOfComments(userId : number):Promise<number> {
    const user = await this.inscriptionUserRepository.findOne({
      where : {id : userId},
      relations: ['profile'],
    });

    if(!user) {
      throw new error("L'utilisateur est introuvable !")
    }

    return user.profile.totalComments;
  }
}
