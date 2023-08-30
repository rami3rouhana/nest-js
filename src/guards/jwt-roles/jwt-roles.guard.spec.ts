import { Test, TestingModule } from '@nestjs/testing';
import { JwtRolesGuard } from './jwt-roles.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('JwtRolesGuard', () => {
  let guard: JwtRolesGuard;
  let jwtServiceMock: any;
  let reflectorMock: any;
  let mockContext: any;

  beforeEach(async () => {
    jwtServiceMock = {
      verify: jest.fn(),
    };

    reflectorMock = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRolesGuard,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: Reflector, useValue: reflectorMock },
      ],
    }).compile();

    guard = module.get<JwtRolesGuard>(JwtRolesGuard);

    mockContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getRequest: jest.fn().mockReturnValue({
        headers: {
          authorization: 'Bearer mockToken',
        },
      }),
    };
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should validate JWT and roles', () => {
    reflectorMock.get.mockReturnValue(['user', 'admin']); // Expected roles

    jwtServiceMock.verify.mockReturnValueOnce({ role: 'user' }); // Mock payload

    const canActivateResult = guard.canActivate(mockContext);

    expect(canActivateResult).toBe(true);
    expect(reflectorMock.get).toHaveBeenCalledWith('roles', undefined);
  });
});
