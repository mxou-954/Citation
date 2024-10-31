import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { ProfileData } from '../profile/profile.entity'; // Import de l'autre entité
import { CommentData } from '../comments/comments.entity';

@Entity('quoteData')
export class QuoteData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quote: string;

  @Column()
  author: string;

  @Column()
  date: Date;

  @Column({ default: 0 })
  like: number;

  // Relation avec ProfileData, une citation appartient à un profil
  @ManyToOne(() => ProfileData, profile => profile.quotes)
  profile: ProfileData;

  @OneToMany(() => CommentData, comment => comment.quote)
  comments: CommentData[];
}