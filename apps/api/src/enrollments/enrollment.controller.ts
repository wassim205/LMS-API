import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EnrollmentService } from './enrollment.service';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post(':courseId')
  async enroll(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.enrollmentService.enroll(user.userId, courseId);
  }

  @Get(':courseId/check')
  async checkEnrollment(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentService.checkEnrollment(user.userId, courseId);
  }

  @Get('my-courses')
  async getMyCourses(@CurrentUser() user: any) {
    return this.enrollmentService.getStudentEnrollments(user.userId);
  }
}
