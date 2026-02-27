import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RefreshGuard } from 'src/common/guards/refresh-auth.guard';
import type { AuthenticatedRequest } from 'src/common/interfaces/request-with-user.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    const { accessToken, refreshToken } = await this.authService.login(
      user as typeof user & { _id: string },
    );

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    response.cookie('Role', user.role, {
      httpOnly: false, // Accessible by client/middleware
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(req.user.userId);
    response.clearCookie('Authentication');
    response.clearCookie('Refresh');
    response.clearCookie('Role');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refresh(
    @Request() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userId = req.user.sub;
    const oldRefreshToken = req.user.refreshToken;

    // 1. Verify refresh token against DB hash
    await this.authService.validateRefreshToken(userId, oldRefreshToken);

    // 2. Generate new tokens (Rotation)
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.getTokens(userId, req.user.email, req.user.role);

    // 3. Update hash in DB
    await this.authService.updateRefreshTokenHash(userId, newRefreshToken);

    // 4. Update cookies
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('Refresh', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    response.cookie('Role', req.user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Tokens refreshed' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.userId);
  }
}
