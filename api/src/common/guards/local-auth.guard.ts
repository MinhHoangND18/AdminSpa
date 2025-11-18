import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

const LocalStrategyGuard = AuthGuard('local');

@Injectable()
export class LocalAuthGuard extends LocalStrategyGuard {}
