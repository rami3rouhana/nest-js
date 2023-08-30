import { Injectable } from '@nestjs/common';
import { CorsConfig } from './cors-config';

@Injectable()
export class ConfigurationService {
  static get corsConfig() {
    return CorsConfig;
  }
}
