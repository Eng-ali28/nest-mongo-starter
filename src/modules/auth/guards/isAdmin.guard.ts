import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Is_Public_key } from 'src/common/decorators/public.decorator';
import { AuthRequest } from '../types/authUser.types';

@Injectable()
export default class AdminGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(ctx: ExecutionContext): boolean | Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride(Is_Public_key, [ctx.getClass(), ctx.getHandler()]);
        if (isPublic) return true;

        const req = ctx.switchToHttp().getRequest() as AuthRequest;

        if (!req.user.isAdmin) {
            throw new ForbiddenException("Can't access this route.");
        }

        return true;
    }
}
