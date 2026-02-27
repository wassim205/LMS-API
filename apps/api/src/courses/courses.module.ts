import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseSchema } from './schemas/course.schema';

import {
  CourseLesson,
  CourseLessonSchema,
} from '../course-lessons/schemas/course-lesson.schema';
import {
  Module as CourseModuleEntity,
  CourseModuleSchema,
} from '../course-modules/schemas/course-module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: CourseModuleEntity.name, schema: CourseModuleSchema },
      { name: CourseLesson.name, schema: CourseLessonSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
