import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { InscriptionUser } from '../inscription/inscription.entity';  // Import de l'autre entité
import { QuoteData } from '../quote/quote.entity'; // Import de l'entité QuoteData

@Entity('profileData')
export class ProfileData {
  @PrimaryGeneratedColumn()
  id: number;
  
  // Relation avec InscriptionUser, cette relation permet de récupérer l'email et le nom
  @OneToOne(() => InscriptionUser, user => user.profile)
  @JoinColumn()  // Nécessaire pour établir la relation "OneToOne"
  user: InscriptionUser;

  @Column()
  profilePicture: string;

  @Column()
  quotesPosted: number;

  @Column()
  totalLikes: number;

  @Column()
  totalComments: number;

  // Stocker les IDs des citations likées dans un tableau de nombres
  @Column('simple-array', { default: [] })
  quoteLikeIDs: number[];

  // Relation avec QuoteData, un profil peut avoir plusieurs citations
  @OneToMany(() => QuoteData, quote => quote.profile)
  quotes: QuoteData[];
}