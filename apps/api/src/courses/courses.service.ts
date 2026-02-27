import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CourseStatus } from 'src/common/enums/course.enum';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseDocument } from './schemas/course.schema';

import {
  CourseLesson,
  CourseLessonDocument,
} from '../course-lessons/schemas/course-lesson.schema';
import {
  CourseModuleDocument,
  Module as CourseModuleEntity,
} from '../course-modules/schemas/course-module.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(CourseModuleEntity.name)
    private readonly moduleModel: Model<CourseModuleDocument>,
    @InjectModel(CourseLesson.name)
    private readonly lessonModel: Model<CourseLessonDocument>,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    instructorId: string,
  ): Promise<CourseDocument> {
    if (!Types.ObjectId.isValid(instructorId)) {
      throw new BadRequestException('Invalid instructor id');
    }

    try {
      const course = new this.courseModel({
        ...createCourseDto,
        instructorId: new Types.ObjectId(instructorId),
      });
      return await course.save();
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Course title already exists');
      }
      throw error;
    }
  }

  async findAll(instructorId: string): Promise<CourseDocument[]> {
    if (!Types.ObjectId.isValid(instructorId)) {
      throw new BadRequestException('Invalid instructor id');
    }

    return this.courseModel
      .find({ instructorId: new Types.ObjectId(instructorId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findOne(id: string, instructorId: string): Promise<CourseDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid course id');
    }
    if (!Types.ObjectId.isValid(instructorId)) {
      throw new BadRequestException('Invalid instructor id');
    }

    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.instructorId.equals(instructorId)) {
      throw new ForbiddenException('You do not own this course');
    }

    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    instructorId: string,
  ): Promise<CourseDocument> {
    const course = await this.findOne(id, instructorId);

    // If attempting to publish, validate content
    if (
      updateCourseDto.status === CourseStatus.Published &&
      course.status !== CourseStatus.Published
    ) {
      await this.validateCourseForPublication(id);
    }

    Object.assign(course, updateCourseDto);
    return course.save();
  }

  private async validateCourseForPublication(courseId: string) {
    const modules = await this.moduleModel
      .find({ courseId: new Types.ObjectId(courseId) })
      .lean();

    if (!modules || modules.length === 0) {
      throw new BadRequestException(
        'Cannot publish course: It must have at least one module.',
      );
    }

    const moduleIds = modules.map((m) => m._id);
    const lessonsCount = await this.lessonModel.aggregate([
      { $match: { moduleId: { $in: moduleIds }, isActive: true } },
      { $group: { _id: '$moduleId', count: { $sum: 1 } } },
    ]);

    const modulesWithLessons = new Set(
      lessonsCount.map((l) => l._id.toString()),
    );

    for (const module of modules) {
      if (!modulesWithLessons.has(module._id.toString())) {
        throw new BadRequestException(
          `Cannot publish course: Module "${module.title}" is empty (no lessons).`,
        );
      }
    }
  }

  async remove(id: string, instructorId: string): Promise<void> {
    const course = await this.findOne(id, instructorId);
    await course.deleteOne();
  }

  // Public methods for student/unauthenticated access
  async findAllPublic(filters?: {
    category?: string;
    level?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ courses: any[]; total: number; page: number; pages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const skip = (page - 1) * limit;

    const query: any = {
      isPublicVisible: true,
      status: 'published',
    };

    if (filters?.category) {
      if (filters.category.includes(',')) {
        query.category = { $in: filters.category.split(',') };
      } else {
        query.category = filters.category;
      }
    }

    if (filters?.level) {
      query.level = filters.level;
    }

    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.courseModel
        .find(query)
        .populate('instructorId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.courseModel.countDocuments(query).exec(),
    ]);

    return {
      courses,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findOnePublic(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid course id');
    }

    const course = await this.courseModel
      .findOne({ _id: id, isPublicVisible: true, status: 'published' })
      .populate('instructorId', 'firstName lastName email')
      .lean()
      .exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async getCategoriesWithCounts(): Promise<
    { category: string; count: number }[]
  > {
    return this.courseModel
      .aggregate([
        { $match: { isPublicVisible: true, status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { category: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ])
      .exec();
  }
}
