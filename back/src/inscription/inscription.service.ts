import { Injectable } from '@nestjs/common';
import { InscriptionUser } from 'src/entity/inscription/inscription.entity';
import { ProfileData } from 'src/entity/profile/profile.entity'; // Importer l'entité du profil
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InscriptionService {
  constructor(
    @InjectRepository(InscriptionUser)
    private inscriptionUserRepository: Repository<InscriptionUser>,

    @InjectRepository(ProfileData) // Ajouter le repository pour ProfileData
    private profileDataRepository: Repository<ProfileData>,
  ) {}

  // Recherche si un utilisateur avec l'email existe déjà
  async findUserByEmail(email: string): Promise<boolean> {
    const user = await this.inscriptionUserRepository.findOne({
      where: { email },
    });
    return !!user; // Retourne true si un utilisateur est trouvé, sinon false
  }

  // Crypter le mdp et vérifier s'ils concordent
  async checkPasswordAndCrypt(userData: {
    nom: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<InscriptionUser | boolean> {
    // Vérifier si le mot de passe et la confirmation sont identiques
    if (userData.password !== userData.confirmPassword) {
      return false; // Les mots de passe ne correspondent pas
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Créer un nouvel utilisateur avec le mot de passe haché
    const newUser = new InscriptionUser();
    newUser.email = userData.email;
    newUser.nom = userData.nom;
    newUser.password = hashedPassword;

    // Sauvegarder le nouvel utilisateur dans la base de données
    const savedUser = await this.inscriptionUserRepository.save(newUser);

    // Créer un profil pour cet utilisateur
    const newProfile = new ProfileData();
    newProfile.user = savedUser;
    newProfile.profilePicture = ''; // Tu peux définir une valeur par défaut ici
    newProfile.quotesPosted = 0;
    newProfile.totalLikes = 0;
    newProfile.totalComments = 0;

    // Sauvegarder le profil dans la base de données
    await this.profileDataRepository.save(newProfile);

    return savedUser;
  }

  async findName(userId: number): Promise<string> {
    const user = await this.inscriptionUserRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user.nom;
  }

  async changeName(userId: number, newName: string): Promise<InscriptionUser> {
    const user = await this.inscriptionUserRepository.findOne({
      where: { id: userId },
    });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    user.nom = newName;
  
    const savedUser = await this.inscriptionUserRepository.save(user);
  
    return savedUser;
  }
}
