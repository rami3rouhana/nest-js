import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import CSRFTokenError from 'src/errors/CSRFTokenError';
import { ValidationError } from 'src/errors/ValidationError';
import {
  ApiBody,
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiCookieAuth,
  ApiHeader,
} from '@nestjs/swagger';
import {
  CSRFTokenErrorDto,
  LoginResponseDto,
  ValidationErrorDto,
} from './dto/login-response.dto';
import { RefreshTokenRequiredError } from 'src/errors/RefreshTokenRequiredError';

@ApiTags('Authentication')
@Controller('auth')
@ApiCookieAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'This route requires a valid CSRF token in the x-csrf-token header.',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    allowEmptyValue: false,
    description: 'CSRF token',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({
    status: 400,
    description:
      'Username already exists or Username and password are required',
  })
  @ApiResponse({
    status: 403,
    description: 'CSRF token validation failed',
    type: CSRFTokenErrorDto,
  })
  async register(@Req() req: Request, @Res() res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ValidationError('Username and password are required');
    }

    const existingUser = await this.authService.doesUsernameExist(username);
    if (existingUser) {
      throw new ValidationError('Username already exists');
    }

    const newUser = await this.authService.register(username, password);

    return res.send({
      message: 'User successfully registered',
      user: newUser,
    });
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login an existing user',
    description:
      'This route requires a valid CSRF token in the x-csrf-token header.',
  })
  @ApiHeader({
    name: 'x-csrf-token',
    allowEmptyValue: false,
    allowReserved: false,
    required: true,
    description: 'CSRF token',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid username or password',
    type: ValidationErrorDto,
  })
  @ApiResponse({
    status: 403,
    description: 'CSRF token validation failed',
    type: CSRFTokenErrorDto,
  })
  async login(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { username, password } = createUserDto;

    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new ValidationError('Invalid username or password');
    }

    const jwt = await this.authService.login(user);

    res.cookie('refresh-token', jwt.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    return res.status(HttpStatus.OK).json({
      message: 'Login successful',
      accessToken: jwt.accessToken,
    });
  }

  // for testing purposes
  @Get('token')
  @ApiOperation({ summary: 'Get CSRF token' })
  @ApiResponse({ status: 200, description: 'CSRF token generated' })
  getToken(@Req() req: Request, @Res() res: Response) {
    return res.send({ status: 'success' });
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const oldRefreshToken = req.cookies['refresh-token'];
    if (!oldRefreshToken) {
      throw new RefreshTokenRequiredError();
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshToken(oldRefreshToken);

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    return res.status(HttpStatus.OK).json({
      message: 'Access token refreshed successfully',
      accessToken: accessToken,
    });
  }
}
