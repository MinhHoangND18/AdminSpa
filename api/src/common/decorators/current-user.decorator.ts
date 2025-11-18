import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { UserEntity } from '@/modules/users/entities/user.entity';

interface RequestWithUser extends Request {
  user?: UserEntity;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity | undefined => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return req.user;
  },
);
