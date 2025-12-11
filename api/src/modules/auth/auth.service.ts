import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<Omit<UserEntity, 'password_hash'>> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.is_locked) {
      throw new UnauthorizedException(
        'Account is locked. Please contact administrator'
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Increment login attempts
      // await this.userRepository.update(user.id, {
      //   login_attempts: user.login_attempts + 1,
      //   is_locked: user.login_attempts + 1 >= 5,
      // });

      // if (user.login_attempts + 1 >= 5) {
      //   throw new UnauthorizedException(
      //     'Account locked due to too many failed attempts'
      //   );
      // }

      throw new UnauthorizedException('Invalid username or password');
    }

    // Reset login attempts on successful login
    await this.userRepository.update(user.id, {
      login_attempts: 0,
      last_login: new Date(),
    });

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: Omit<UserEntity, 'password_hash'>) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      success: true,
      message: 'Login successful',
      data: {
        token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          staff_id: user.staff_id,
          last_login: user.last_login,
          is_locked: user.is_locked,
          is_active: user.is_active,
        },
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'reset' },
      { expiresIn: '1h' },
    );

    // TODO: Send email
    // await this.emailService.sendPasswordReset(user.email, resetToken);

    return {
      success: true,
      message: 'Password reset instructions have been sent to your email',
      resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'reset') {
        throw new BadRequestException('Invalid reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.userRepository.update(payload.sub, {
        password_hash: hashedPassword,
        login_attempts: 0,
        is_locked: false,
      });

      return {
        success: true,
        message: 'Password has been reset successfully',
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}