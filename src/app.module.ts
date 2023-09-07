import { MiddlewareConsumer, Module, NestModule, Global } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HelmetMiddleware } from './middleware/helmet.middleware';
import { CompressionMiddleware } from './middleware/compression.middleware';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { CustomLoggerService } from './services/custom-logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ConfigurationModule } from './config/config.module';
import { MonitoringInterceptor } from './interceptors/monitoring.interceptor';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { CsrfMiddleware } from './middleware/csrf.middleware';
import { SwaggerInterceptor } from './interceptors/swagger.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { HeaderVersioningMiddleware } from './middleware/header-versioning.middleware';
import { MongoConfigModule } from './database/mongo-config.module';
import { JwtConfigModule } from './config/jwt-config.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigurationModule,
    JwtConfigModule,
    MongoConfigModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    CustomLoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MonitoringInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SwaggerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        HelmetMiddleware,
        CompressionMiddleware,
        CsrfMiddleware,
        HeaderVersioningMiddleware,
      )
      .forRoutes('*');
  }
}
