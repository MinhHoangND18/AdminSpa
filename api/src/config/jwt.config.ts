import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  signOptions: {
    expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600,
  },
};
