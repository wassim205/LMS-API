import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model, Types } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { QuestionType } from '../src/common/enums/question-type.enum';
import { Role } from '../src/common/enums/role.enum';
import {
    CourseLesson,
    LessonContentType,
} from '../src/course-lessons/schemas/course-lesson.schema';
import { Module as CourseModule } from '../src/course-modules/schemas/course-module.schema';
import { Course } from '../src/courses/schemas/course.schema';
import { Quiz } from '../src/quiz/schema/quiz.schema';

type SeedOption = {
  _id: Types.ObjectId;
  text: string;
  isCorrect: boolean;
};

type SeedQuestion = {
  _id: Types.ObjectId;
  text: string;
  type: QuestionType;
  options: SeedOption[];
};

function buildQuizQuestions(): SeedQuestion[] {
  return Array.from({ length: 4 }).map(
    (_, idx): SeedQuestion => ({
      _id: new Types.ObjectId(),
      text: `Q${idx + 1}`,
      type: QuestionType.QCM,
      options: [
        { _id: new Types.ObjectId(), text: 'A', isCorrect: true },
        { _id: new Types.ObjectId(), text: 'B', isCorrect: false },
      ],
    }),
  );
}

describe('Progression + Quiz (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  let courseModel: Model<Course>;
  let moduleModel: Model<CourseModule>;
  let lessonModel: Model<CourseLesson>;
  let quizModel: Model<Quiz>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    courseModel = moduleFixture.get(getModelToken(Course.name));
    moduleModel = moduleFixture.get(getModelToken(CourseModule.name));
    lessonModel = moduleFixture.get(getModelToken(CourseLesson.name));
    quizModel = moduleFixture.get(getModelToken('Quiz'));
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongoServer) await mongoServer.stop();
  });

  it('enroll initializes progress, progress endpoints work, and quiz-attempt start/submit works', async () => {
    const httpServer = app.getHttpServer();

    // Seed minimal course structure
    const instructorId = new Types.ObjectId();

    const course = await courseModel.create({
      title: 'Course 1',
      description: 'desc',
      category: 'Development',
      level: 'Beginner',
      instructorId,
    });

    const module1 = await moduleModel.create({
      title: 'Module 1',
      courseId: course._id,
      order: 0,
    });

    const module2 = await moduleModel.create({
      title: 'Module 2',
      courseId: course._id,
      order: 1,
    });

    const lesson1 = await lessonModel.create({
      title: 'Lesson 1',
      moduleId: module1._id,
      order: 0,
      type: LessonContentType.VIDEO,
      contentUrl: 'http://example.com/video',
    });

    const questions = buildQuizQuestions();
    const quiz = await quizModel.create({
      moduleId: module1._id,
      title: 'Quiz 1',
      passingScore: 50,
      timeLimit: 0,
      questions,
    });

    const courseId = course._id.toString();
    const lessonId = lesson1._id.toString();
    const quizId = quiz._id.toString();

    // Create student (Apprenant) and login
    const studentAgent = request.agent(httpServer);

    await studentAgent.post('/auth/register').send({
      email: 'student-progress@test.com',
      password: 'password',
      firstName: 'Student',
      lastName: 'Progress',
      role: Role.Apprenant,
    });

    await studentAgent.post('/auth/login').send({
      email: 'student-progress@test.com',
      password: 'password',
    });

    // Enroll -> should initialize progress
    const enrollRes = await studentAgent.post(`/enrollments/${courseId}`);
    expect([200, 201]).toContain(enrollRes.status);

    // Progress overall should exist with module1 unlocked only
    const progressRes = await studentAgent.get(`/progress/${courseId}`);
    expect(progressRes.status).toBe(200);
    expect(progressRes.body.courseId).toBeDefined();
    expect(progressRes.body.modules.length).toBe(2);

    const sortedModules = [...progressRes.body.modules].sort(
      (a: any, b: any) => a.order - b.order,
    );
    expect(sortedModules[0].isUnlocked).toBe(true);
    expect(sortedModules[1].isUnlocked).toBe(false);

    // Toggle lesson completion
    const toggleRes = await studentAgent.post(`/progress/${lessonId}/toggle`);
    expect(toggleRes.status).toBe(201);
    expect(toggleRes.body.isCompleted).toBe(true);

    // Start quiz (should be allowed since module1 is unlocked)
    const startRes = await studentAgent.get(
      `/quiz-attempts/quiz/${quizId}/start`,
    );
    expect(startRes.status).toBe(200);
    expect(startRes.body.questions.length).toBe(4);

    // Submit quiz (answer all questions, choose correct option)
    const answers = questions.map((q) => ({
      questionId: q._id.toString(),
      selectedOptionId: q.options.find((o) => o.isCorrect)!._id.toString(),
    }));

    const submitRes = await studentAgent
      .post(`/quiz-attempts/quiz/${quizId}/submit`)
      .send({ answers });

    expect(submitRes.status).toBe(201);
    expect(submitRes.body.passed).toBe(true);

    // After passing, next module should be unlocked
    const progressAfterRes = await studentAgent.get(`/progress/${courseId}`);
    expect(progressAfterRes.status).toBe(200);
    const sortedAfter = [...progressAfterRes.body.modules].sort(
      (a: any, b: any) => a.order - b.order,
    );
    expect(sortedAfter[1].isUnlocked).toBe(true);

    // sanity: module2 exists to avoid unused warnings
    expect(module2._id).toBeDefined();
  });
});
