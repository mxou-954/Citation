import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuoteData } from 'src/entity/quote/quote.entity';
import { InscriptionUser } from 'src/entity/inscription/inscription.entity';
import { ProfileData } from 'src/entity/profile/profile.entity';
import { CommentData } from 'src/entity/comments/comments.entity';
import { error } from 'console';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentData)
    private commentDataRepository: Repository<CommentData>,

    @InjectRepository(QuoteData)
    private quoteDataRepository: Repository<QuoteData>,

    @InjectRepository(ProfileData)
    private profileDataRepository: Repository<ProfileData>,

    @InjectRepository(InscriptionUser)
    private inscriptionUserRepository: Repository<InscriptionUser>,
  ) {}

  async newComment(
    data: { comment: string; date: Date; quoteId: number },
    userId: number,
  ): Promise<CommentData> {
    const user = await this.inscriptionUserRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user || !user.profile) {
      throw new Error('Utilisateur ou profil introuvable');
    }

    const quote = await this.quoteDataRepository.findOne({
      where: { id: data.quoteId },
    });

    if (!quote) {
      throw new BadRequestException("La citation associée n'existe pas.");
    }

    const newComment = new CommentData();
    newComment.content = data.comment;
    newComment.date = data.date;
    newComment.author = user;
    newComment.authorName = user.nom;
    newComment.quote = quote;
    newComment.authorId = user.profile.id;

    // Incrémenter le compteur de commentaires dans le profil
    user.profile.totalComments += 1;
    await this.profileDataRepository.save(user.profile);

    return this.commentDataRepository.save(newComment);
  }

  async allComments(id: number): Promise<CommentData[]> {
    const quote = await this.quoteDataRepository.findOne({
      where: { id: id },
      relations: ['comments'],
    });

    if (!quote) {
      throw new BadRequestException("La citation n'existe pas.");
    }

    return quote.comments;
  }

  async deleteComment(id: string): Promise<void> {
    const result = await this.commentDataRepository.delete(id);

    if (result.affected === 0) {
      throw new Error('Commentaire non trouvé ou déjà supprimé.');
    }
  }

  async deleteReply(id: number): Promise<void> {
    // Vérifie si la réponse existe
    const response = await this.commentDataRepository.findOne({
      where: { id: id },
    });

    if (!response) {
      throw new BadRequestException('La réponse est introuvable.');
    }

    // Supprime la réponse
    await this.commentDataRepository.remove(response);
  }

  async toogleLike(userId: number, commentId: number): Promise<CommentData> {
    const user = await this.inscriptionUserRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user || !user.profile) {
      throw new UnauthorizedException('Utilisateur ou profil introuvable');
    }

    const comment = await this.commentDataRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new BadRequestException('Le commentaire est introuvable');
    }

    // Ensure likedBy array has unique IDs and remove invalid entries
    comment.likedBy = Array.from(
      new Set(
        comment.likedBy.map((id) => Number(id)).filter((id) => !isNaN(id)),
      ),
    );

    const hasLiked = comment.likedBy.includes(userId);

    if (hasLiked) {
      comment.likeCount = Math.max(0, comment.likeCount - 1);
      comment.likedBy = comment.likedBy.filter((id) => id !== userId);
    } else {
      comment.likeCount += 1;
      comment.likedBy.push(userId);
    }

    await this.commentDataRepository.save(comment);

    return comment;
  }

  async createReply(
    data: { content: string; parentCommentId: number; date: Date },
    userId: number,
  ): Promise<CommentData> {
    const user = await this.inscriptionUserRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }

    const parentComment = await this.commentDataRepository.findOne({
      where: { id: data.parentCommentId },
      relations: ['replies'], // Charger les réponses pour lier la nouvelle
    });
    if (!parentComment) {
      throw new BadRequestException('Commentaire parent introuvable.');
    }

    // Créer une nouvelle réponse
    const reply = new CommentData();
    reply.content = data.content;
    reply.date = data.date;
    reply.author = user;
    reply.authorName = user.nom;
    reply.authorId = user.id;
    reply.parentComment = parentComment;

    return await this.commentDataRepository.save(reply);
  }

  async getReplies(parentCommentId: number): Promise<CommentData[]> {
    return this.commentDataRepository.find({
      where: { parentComment: { id: parentCommentId } },
      relations: ['author'], // Inclut l'auteur si besoin
    });
  }

  async toggleLikeResponse(
    userId: number,
    responseId: number,
  ): Promise<CommentData> {
    const response = await this.commentDataRepository.findOne({
      where: { id: responseId },
    });

    if (!response) {
      throw new BadRequestException('La réponse est introuvable.');
    }

    // Nettoyage et vérification des likes
    response.likedBy = Array.from(
      new Set(
        response.likedBy.map((id) => Number(id)).filter((id) => !isNaN(id)),
      ),
    );

    const hasLiked = response.likedBy.includes(userId);
    if (hasLiked) {
      response.likeCount = Math.max(0, response.likeCount - 1);
      response.likedBy = response.likedBy.filter((id) => id !== userId);
    } else {
      response.likeCount += 1;
      response.likedBy.push(userId);
    }

    await this.commentDataRepository.save(response);
    return response;
  }

  async getReplieslike(parentCommentId: number): Promise<CommentData[]> {
    const parentComment = await this.commentDataRepository.findOne({
      where: { id: parentCommentId },
      relations: ['replies'],
    });

    if (!parentComment) {
      throw new BadRequestException('Commentaire parent introuvable.');
    }

    return parentComment.replies;
  }

  async modifComment(
    content: string,
    commentId: number,
    date: Date,
  ): Promise<CommentData> {
    const comment = await this.commentDataRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new BadRequestException('Commentaire introuvable');
    }

    comment.content = content;
    comment.date = date;
    await this.commentDataRepository.save(comment);

    return comment;
  }

  async modifyReply(
    content: string,
    replyId: number,
    date: Date,
  ): Promise<CommentData> {
    const reply = await this.commentDataRepository.findOne({
      where: { id: replyId },
    });
    if (!reply) {
      throw new BadRequestException('Réponse introuvable');
    }
  
    reply.content = content;
    reply.date = date;
    await this.commentDataRepository.save(reply);
  
    return reply;
  }
}
