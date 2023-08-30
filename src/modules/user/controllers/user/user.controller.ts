import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { JwtRolesGuard } from 'src/guards/jwt-roles/jwt-roles.guard';

@UseGuards(JwtRolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  getAdminUser() {
    return this.userService.getUserInfo();
  }
}
