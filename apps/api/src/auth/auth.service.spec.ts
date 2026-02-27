import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/common/enums/role.enum';
import { UsersService } from '../users/user.service';
import { AuthService } from './auth.service';

type MockUsersService = {
  findOne: jest.Mock;
  create: jest.Mock;
  findById: jest.Mock;
  updateRefreshToken: jest.Mock;
};

type MockJwtService = {
  signAsync: jest.Mock;
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: MockUsersService;
  let jwtService: MockJwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            updateRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
    jwtService = moduleRef.get(JwtService);

    process.env.JWT_SECRET = 'unit-test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'unit-test-jwt-refresh-secret';
  });

  it('validateUser throws UnauthorizedException when user not found', async () => {
    usersService.findOne.mockResolvedValue(null as any);

    await expect(
      authService.validateUser('x@test.com', 'password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('validateUser throws UnauthorizedException when password is invalid', async () => {
    const hashed = await bcrypt.hash('correct', 10);
    usersService.findOne.mockResolvedValue({
      toObject: () => ({
        _id: 'u1',
        email: 'x@test.com',
        password: hashed,
        role: Role.Apprenant,
        firstName: 'A',
        lastName: 'B',
      }),
      password: hashed,
    } as any);

    await expect(
      authService.validateUser('x@test.com', 'wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('validateUser returns user without password when credentials are valid', async () => {
    const hashed = await bcrypt.hash('password', 10);

    usersService.findOne.mockResolvedValue({
      toObject: () => ({
        _id: 'u1',
        email: 'x@test.com',
        password: hashed,
        role: Role.Apprenant,
        firstName: 'A',
        lastName: 'B',
      }),
      password: hashed,
    } as any);

    const user = await authService.validateUser('x@test.com', 'password');

    expect(user.email).toBe('x@test.com');
    expect((user as any).password).toBeUndefined();
  });

  it('register throws ConflictException when email already exists', async () => {
    usersService.findOne.mockResolvedValue({} as any);

    await expect(
      authService.register({
        email: 'exists@test.com',
        password: 'password',
        firstName: 'A',
        lastName: 'B',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login returns tokens and updates refresh token hash', async () => {
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    usersService.updateRefreshToken.mockResolvedValue(undefined);

    const tokens = await authService.login({
      _id: 'u1',
      email: 'x@test.com',
      role: Role.Apprenant,
    } as any);

    expect(tokens.accessToken).toBe('access-token');
    expect(tokens.refreshToken).toBe('refresh-token');
    expect(usersService.updateRefreshToken).toHaveBeenCalledTimes(1);
  });
});
