import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { JwtRolesGuard } from 'src/guards/jwt-roles/jwt-roles.guard';
import { Reflector } from '@nestjs/core';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: Reflector,
          useValue: {},
        },
      ],
    })
      .overrideGuard(JwtRolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getUserInfo', () => {
    it('should return success status', () => {
      const result = userService.getUserInfo();
      expect(result).toEqual({ status: 'Success' });
    });
  });
});
