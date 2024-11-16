import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { ProfileData } from '../profile/profile.entity';

@Entity('amis')
export class Amis {
  @PrimaryGeneratedColumn()
  id: number;

  // L'utilisateur qui envoie la demande d'amitié
  @ManyToOne(() => ProfileData, { cascade: true })
  sender: ProfileData;

  // L'utilisateur qui reçoit la demande d'amitié
  @ManyToOne(() => ProfileData, { cascade: true })
  receiver: ProfileData;

  @Column()
  dateAdded: Date;

  // Statut de la demande d'amitié
  @Column({ type: 'enum', enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected';
}