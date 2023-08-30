import { Injectable, UseGuards } from '@nestjs/common';
import { JwtRolesGuard } from 'src/guards/jwt-roles/jwt-roles.guard';

@Injectable()
@UseGuards(JwtRolesGuard)
export class UserService {
  getUserInfo() {
    return { status: 'Success' };
  }
}
