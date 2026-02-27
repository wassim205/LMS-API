import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { CourseLessonsModule } from './course-lessons/course-lessons.module';
import { CourseModulesModule } from './course-modules/course-modules.module';
import { CoursesModule } from './courses/courses.module';
import { DatabaseModule } from './database/database.module';
import { EnrollmentModule } from './enrollments/enrollment.module';
import { ProgressModuleModule } from './progress-module/progress-module.module';
import { QuizAttempModule } from './quiz-attempt/quiz-attempt.module';
import { QuizModule } from './quiz/quiz.module';
import { UploadsModule } from './uploads/uploads.module';

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    // Rate Limiting: 10 requests per 60 seconds by default
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    //ConfigModule
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    //Connexion MongoDB
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    DatabaseModule,
    AuthModule,
    QuizModule,
    CoursesModule,
    CourseModulesModule,
    CourseLessonsModule,
    UploadsModule,
    CommonModule,
    QuizAttempModule,
    ProgressModuleModule,
    EnrollmentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
