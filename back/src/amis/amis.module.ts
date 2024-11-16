import { Module } from '@nestjs/common';
import { AmisController } from './amis.controller';
import { AmisService } from './amis.service';
import { Amis } from 'src/entity/amis/amis.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileData } from 'src/entity/profile/profile.entity';
import { InscriptionUser } from 'src/entity/inscription/inscription.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Amis, ProfileData, InscriptionUser])],
  controllers: [AmisController],
  providers: [AmisService]
})
export class AmisModule {}
