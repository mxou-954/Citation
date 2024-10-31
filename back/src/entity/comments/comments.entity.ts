import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { InscriptionUser } from '../inscription/inscription.entity';
import { QuoteData } from '../quote/quote.entity';

@Entity('commentData')
export class CommentData {
  @PrimaryGeneratedColumn()
  id: number;

  // Auteur du commentaire
  @ManyToOne(() => InscriptionUser, (user) => user.comments)
  @JoinColumn()
  author: InscriptionUser;

  @Column({ default: "test" })
  authorName: string; // Nouveau champ pour stocker le nom

  @Column()
  authorId: number;

  // Contenu du commentaire
  @Column()
  content: string;

  // Nombre de likes sur le commentaire
  @Column({ default: 0 })
  likeCount: number;

  @Column()
  date: Date;

  // Relation vers la citation commentée
  @ManyToOne(() => QuoteData, (quote) => quote.comments)
  @JoinColumn()
  quote: QuoteData;

  // Relation pour les réponses au commentaire (auto-référentiel)
  @ManyToOne(() => CommentData, (comment) => comment.replies)
  @JoinColumn()
  parentComment: CommentData;

  @OneToMany(() => CommentData, (comment) => comment.parentComment, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  replies: CommentData[];

  // IDs des utilisateurs qui ont liké ce commentaire
  @Column('simple-array', { default: [] })
  likedBy: number[];
}

