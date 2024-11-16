import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InscriptionUser } from 'src/entity/inscription/inscription.entity';

@Injectable()
export class ConnexionService {
  constructor(
    @InjectRepository(InscriptionUser)
    private inscriptionRepository: Repository<InscriptionUser>,
  ) {}

  async findUserByEmail(email: string): Promise<InscriptionUser | undefined> {
    return this.inscriptionRepository.findOne({
      where: { email },
      relations: ['profile'], // Inclut la relation pour obtenir le profil
    });
  }

  async validationPassword(
    password: string,
    hashedPassword: string,
  ): Promise<Boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
