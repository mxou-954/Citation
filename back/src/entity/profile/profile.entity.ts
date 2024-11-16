import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { InscriptionUser } from '../inscription/inscription.entity';
import { QuoteData } from '../quote/quote.entity';

@Entity('profileData')
export class ProfileData {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => InscriptionUser, (user) => user.profile)
  @JoinColumn()
  user: InscriptionUser;

  @Column()
  profilePicture: string;

  @Column()
  quotesPosted: number;

  @Column()
  totalLikes: number;

  @Column()
  totalComments: number;

  // Liste des citations likées
  @Column('simple-array', { default: [] })
  quoteLikeIDs: number[];

  @OneToMany(() => QuoteData, (quote) => quote.profile)
  quotes: QuoteData[];
}
