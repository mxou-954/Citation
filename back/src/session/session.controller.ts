import { Controller, Delete, Get, Request, UnauthorizedException } from '@nestjs/common';

@Controller('session')
export class SessionController {

  @Get()
  async getProfile(@Request() req) {
    if (!req.session.user) {
      throw new UnauthorizedException('Vous devez être connecté pour accéder à cette page');
    }
    return req.session.user; 
  }

  @Delete("delete")
  async deleteSession(@Request() req) {
    if (!req.session.user) {
      throw new UnauthorizedException('Vous devez être connecté pour accéder à cette page');
    }
  
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(new UnauthorizedException('Erreur lors de la suppression de la session'));
        } else {
          resolve({ success: true, message: 'Session supprimée avec succès' });
        }
      });
    });
  }

}