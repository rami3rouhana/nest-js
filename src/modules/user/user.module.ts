import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';
import { AdminUserController } from './controllers/admin-user/admin-user.controller';
import { UserService } from './services/user/user.service';
import { AdminUserService } from './services/admin-user/admin-user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/database/schemas/user.schema';
import { JwtRolesGuard } from 'src/guards/jwt-roles/jwt-roles.guard';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UserController, AdminUserController],
  providers: [
    {
      provide: 'JWTROLES_GUARD',
      useValue: JwtRolesGuard,
    },
    UserService,
    AdminUserService,
  ],
  exports: [MongooseModule],
})
export class UserModule {}
