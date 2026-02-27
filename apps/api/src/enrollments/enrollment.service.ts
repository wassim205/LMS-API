import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProgressModuleService } from '../progress-module/progress-module.service';
import { Enrollment, EnrollmentStatus } from './schema/enrollment.schema';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    private progressService: ProgressModuleService,
  ) {}

  async enroll(studentId: string, courseId: string) {
    const existing = await this.enrollmentModel.findOne({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
    });

    if (existing) {
      if (existing.status === EnrollmentStatus.DROPPED) {
        existing.status = EnrollmentStatus.ACTIVE;
        existing.enrolledAt = new Date();
        return await existing.save();
      }
      return existing; // Already enrolled
    }

    const enrollment = await this.enrollmentModel.create({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
    });

    // Initialize progress tracking
    await this.progressService.initializeCourseProgress(studentId, courseId);

    return enrollment.populate({
      path: 'courseId',
      populate: { path: 'instructorId', select: 'firstName lastName' },
    });
  }

  async checkEnrollment(studentId: string, courseId: string) {
    const enrollment = await this.enrollmentModel
      .findOne({
        studentId: new Types.ObjectId(studentId),
        courseId: new Types.ObjectId(courseId),
        status: EnrollmentStatus.ACTIVE,
      })
      .populate({
        path: 'courseId',
        populate: { path: 'instructorId', select: 'firstName lastName' },
      });

    return {
      isEnrolled: !!enrollment,
      enrollment,
    };
  }

  async getStudentEnrollments(studentId: string) {
    return await this.enrollmentModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate({
        path: 'courseId',
        populate: { path: 'instructorId', select: 'firstName lastName' },
      })
      .sort({ enrolledAt: -1 });
  }
}
