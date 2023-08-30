import { Test, TestingModule } from '@nestjs/testing';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from '../../services/admin-user/admin-user.service';
import { JwtRolesGuard } from 'src/guards/jwt-roles/jwt-roles.guard';
import { Roles, User } from 'src/database/schemas/user.schema'; // Import the User type

describe('AdminUserController', () => {
  let adminUserController: AdminUserController;
  let adminUserService: jest.Mocked<AdminUserService>;

  beforeEach(async () => {
    const mockAdminUserService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUserController],
      providers: [
        {
          provide: AdminUserService,
          useValue: mockAdminUserService,
        },
      ],
    })
      .overrideGuard(JwtRolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    adminUserController = module.get<AdminUserController>(AdminUserController);
    adminUserService = module.get(AdminUserService);
  });

  it('should be defined', () => {
    expect(adminUserController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result: User[] = [
        { username: 'test1', password: 'password1', role: Roles.admin },
        { username: 'test2', password: 'password2', role: Roles.user },
      ]; // Make sure the mock data matches the User type
      adminUserService.findAll.mockResolvedValue(result);

      expect(await adminUserController.findAll()).toBe(result);
    });
  });
});
