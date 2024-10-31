import {
  Controller,
  Post,
  Body,
  Request,
  BadRequestException,
  Get,
  NotFoundException,
  Delete,
  Param,
  UnauthorizedException,
  Put,
} from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('new')
  async new(
    @Request() req,
    @Body() data: { comment: string; date: Date; quoteId: number },
  ) {
    const user = req.session.user.id;
    if (!user) {
      throw new UnauthorizedException("L'utilisateur doit être connecté !");
    }

    const comment = await this.commentService.newComment(data, user);
    if (!comment) {
      throw new BadRequestException('Impossible de créer un commentaire');
    }

    return {
      success: true,
      message: 'Commentaire créé avec succès',
      comment: comment,
    };
  }

  @Get('all/:id')
  async allComments(@Request() req, @Param('id') id: string) {
    const user = req.session.user;
    if (!user) {
      throw new UnauthorizedException("L'utilisateur doit être connecté !");
    }

    const comments = await this.commentService.allComments(Number(id));
    return {
      success: true,
      comments: comments,
    };
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string, @Request() req) {
    if (!req.session.user) {
      throw new BadRequestException('Utilisateur non authentifié.');
    }

    return this.commentService.deleteComment(id);
  }

  @Delete('reply/:id')
  async deleteReply(@Param('id') id: number, @Request() req) {
    if (!req.session.user) {
      throw new BadRequestException('Utilisateur non authentifié.');
    }

    return this.commentService.deleteReply(id);
  }

  @Post('like')
  async likeComment(
    @Request() req,
    @Body() body: { commentId: number }, // Attend commentId comme une propriété de l'objet
  ) {
    const user = req.session.user;
    if (!user) {
      throw new BadRequestException('Utilisateur non authentifié.');
    }

    const result = await this.commentService.toogleLike(
      user.id,
      body.commentId,
    );
    return {
      success: true,
      message: '',
      comment: result,
    };
  }

  @Post('reply')
  async replyToComment(
    @Request() req,
    @Body() data: { content: string; parentCommentId: number; date: Date },
  ) {
    const user = req.session.user;
    if (!user) {
      throw new BadRequestException(
        "L'utilisateur doit être connecté pour répondre à un commentaire.",
      );
    }

    const reply = await this.commentService.createReply(data, user.id);
    return {
      success: true,
      message: 'Réponse ajoutée avec succès',
      reply,
    };
  }

  @Get('replies/:parentCommentId')
  async getReplies(@Param('parentCommentId') parentCommentId: string) {
    const id = parseInt(parentCommentId, 10);
    if (isNaN(id)) {
      throw new BadRequestException("L'ID du commentaire parent est invalide.");
    }

    const replies = await this.commentService.getReplies(id);
    return {
      success: true,
      replies,
    };
  }

  @Post('likeResponse')
  async likeResponse(@Request() req, @Body() body: { responseId: number }) {
    const user = req.session.user;
    if (!user) {
      throw new UnauthorizedException("L'utilisateur doit être connecté.");
    }

    const response = await this.commentService.toggleLikeResponse(
      user.id,
      body.responseId,
    );
    return { success: true, response };
  }

  @Get('replies/:parentCommentId')
  async getReplieslike(
    @Param('parentCommentId') parentCommentId: string,
    @Request() req,
  ) {
    const user = req.session.user;
    if (!user) {
      throw new BadRequestException("L'utilisateur doit être connecté !");
    }

    const replies = await this.commentService.getReplies(
      Number(parentCommentId),
    );
    return {
      success: true,
      replies: replies,
    };
  }

  @Put('modif')
  async modifComment(
    @Body() body: { content: string; commentId: number; date: Date },
    @Request() req,
  ) {
    const user = req.session.user.id;
    if (!user) {
      throw new BadRequestException("L'utilisateur doit être connecté !");
    }

    const response = await this.commentService.modifComment(
      body.content,
      body.commentId,
      body.date,
    );
    if (!response) {
      throw new BadRequestException('Impossible de modifier le commentaire');
    }

    return {
      success: true,
      message: 'Nouveau commentaire :',
      comment: response,
    };
  }

  @Put('reply/modif')
async modifyReply(
  @Body() body: { content: string; replyId: number; date: Date },
  @Request() req,
) {
  const user = req.session.user.id;
  if (!user) {
    throw new BadRequestException("L'utilisateur doit être connecté !");
  }

  const response = await this.commentService.modifyReply(
    body.content,
    body.replyId,
    body.date,
  );
  if (!response) {
    throw new BadRequestException('Impossible de modifier la réponse');
  }

  return {
    success: true,
    message: 'Réponse modifiée avec succès',
    reply: response,
  };
}
}
