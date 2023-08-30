import { ApiProperty } from '@nestjs/swagger';

class JwtDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({ type: JwtDto })
  jwt: JwtDto;
}
export class CSRFTokenErrorDto {
  @ApiProperty({ example: 'Invalid CSRF token' })
  message: string;
}
export class ValidationErrorDto {
  @ApiProperty({ example: 'Invalid username or password' })
  message: string;
}
