import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Amis } from 'src/entity/amis/amis.entity';
import { ProfileData } from 'src/entity/profile/profile.entity';
import { InscriptionUser } from 'src/entity/inscription/inscription.entity';

@Injectable()
export class AmisService {
  constructor(
    @InjectRepository(Amis)
    private readonly amisRepository: Repository<Amis>,

    @InjectRepository(ProfileData)
    private readonly profileDataRepository: Repository<ProfileData>,

    @InjectRepository(InscriptionUser)
    private readonly inscriptionUserRepository: Repository<InscriptionUser>,
  ) {}

  async findFriendProfile(searchTerm: string): Promise<ProfileData | null> {
    const user = await this.inscriptionUserRepository.findOne({
      where: [
        { nom: Like(`%${searchTerm}%`) },
        { email: Like(`%${searchTerm}%`) },
      ],
      relations: ['profile'], // Inclut la relation pour obtenir ProfileData
    });

    return user ? user.profile : null;
  }

  async requestFriendship(
    userProfileId: number,
    friendProfile: ProfileData,
  ): Promise<Amis> {
    // Récupère le profil de l'utilisateur connecté
    const userProfile = await this.profileDataRepository.findOne({
      where: { id: userProfileId },
    });

    if (!userProfile) {
      throw new NotFoundException("Profil utilisateur introuvable.");
    }

    if (userProfile.id === friendProfile.id) {
      throw new ConflictException("Vous ne pouvez pas vous ajouter vous-même.");
    }

    const existingFriendship = await this.amisRepository.findOne({
      where: [
        { sender: userProfile, receiver: friendProfile },
        { sender: friendProfile, receiver: userProfile },
      ],
    });

    if (existingFriendship) {
      throw new ConflictException("La demande d'amitié existe déjà.");
    }

    const newFriendship = new Amis();
    newFriendship.dateAdded = new Date();
    newFriendship.status = 'pending';
    newFriendship.sender = userProfile;
    newFriendship.receiver = friendProfile;

    return await this.amisRepository.save(newFriendship);
  }




  
  async getSentFriendRequests(userId: number) {
    const sentRequests = await this.amisRepository.find({
      where: { sender: { id: userId } },
      relations: ['receiver'], // Charger les profils des destinataires
    });

    // Renvoie les informations sur les destinataires avec le statut
    return sentRequests.map((request) => ({
      id: request.id,
      friend: request.receiver,
      status: request.status,
      dateAdded: request.dateAdded,
    }));
  }

  // Récupère les demandes d'amis reçues par l'utilisateur connecté
  async getReceivedFriendRequests(userId: number) {
    const receivedRequests = await this.amisRepository.find({
      where: { receiver: { id: userId } },
      relations: ['sender'], // Charger les profils des expéditeurs
    });

    // Renvoie les informations sur les expéditeurs avec le statut
    return receivedRequests.map((request) => ({
      id: request.id,
      friend: request.sender,
      status: request.status,
      dateAdded: request.dateAdded,
    }));
  }

  // Accepter ou refuser une demande d'amitié
  async updateFriendRequestStatus(requestId: number, status: 'accepted' | 'rejected') {
    const request = await this.amisRepository.findOne({ where: { id: requestId } });
    if (!request) {
      throw new NotFoundException("Demande d'amitié introuvable.");
    }

    request.status = status;
    await this.amisRepository.save(request);
    return request;
  }
}
