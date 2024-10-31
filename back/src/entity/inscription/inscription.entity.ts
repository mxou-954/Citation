import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';
import { ProfileData } from '../profile/profile.entity';  // Import de l'autre entité
import { CommentData } from '../comments/comments.entity';

@Entity('inscriptionUser')
export class InscriptionUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  email: string;

  @Column()
  password: string;

  // Relation avec ProfileData
  @OneToOne(() => ProfileData, profile => profile.user, { cascade: true })
  profile: ProfileData;

  @OneToMany(() => CommentData, comment => comment.author)
  comments: CommentData[];
}