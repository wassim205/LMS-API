import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/common/interfaces/request-with-user.interface';
import { CourseModulesService } from './course-modules.service';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto';
import { Module as CourseModuleEntity } from './schemas/course-module.schema';

@Controller('course-modules')
export class CourseModulesController {
  constructor(private readonly courseModulesService: CourseModulesService) {}

  /* -------------------------------------------------------------------------- */
  /*                               CREATE MODULE                                  */
  /* -------------------------------------------------------------------------- */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createDto: CreateCourseModuleDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CourseModuleEntity> {
    return this.courseModulesService.create(createDto, req.user.userId);
  }

  /* -------------------------------------------------------------------------- */
  /*                          GET MODULES BY COURSE                                */
  /* -------------------------------------------------------------------------- */
  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  getCourseModules(
    @Param('courseId') courseId: string,
  ): Promise<CourseModuleEntity[]> {
    return this.courseModulesService.getModulesByCourse(courseId);
  }

  /* -------------------------------------------------------------------------- */
  /*                      GET PUBLIC MODULES BY COURSE                             */
  /* -------------------------------------------------------------------------- */
  @Get('public/course/:courseId')
  getPublicCourseModules(
    @Param('courseId') courseId: string,
  ): Promise<CourseModuleEntity[]> {
    return this.courseModulesService.getModulesByCourse(courseId);
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET ONE MODULE                                  */
  /* -------------------------------------------------------------------------- */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<CourseModuleEntity> {
    return this.courseModulesService.findOne(id);
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE MODULE                                   */
  /* -------------------------------------------------------------------------- */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCourseModuleDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CourseModuleEntity> {
    return this.courseModulesService.update(id, updateDto, req.user.userId);
  }

  /* -------------------------------------------------------------------------- */
  /*                             REORDER MODULES                                  */
  /* -------------------------------------------------------------------------- */
  @Patch('course/:courseId/reorder')
  @UseGuards(JwtAuthGuard)
  async reorder(
    @Param('courseId') courseId: string,
    @Body() moduleIds: string[],
  ): Promise<{ message: string }> {
    await this.courseModulesService.reorderModules(courseId, moduleIds);
    return { message: 'Modules reordered successfully' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               DELETE MODULE                                   */
  /* -------------------------------------------------------------------------- */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    await this.courseModulesService.remove(id, req.user.userId);
    return { message: 'Module deleted successfully' };
  }
}
