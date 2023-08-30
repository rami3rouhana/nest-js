import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminUserService } from '../../services/admin-user/admin-user.service';
import { JwtRolesGuard } from 'src/guards/jwt-roles/jwt-roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Roles('admin')
@UseGuards(JwtRolesGuard)
@Controller('admin')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  async findAll() {
    return await this.adminUserService.findAll();
  }
}
