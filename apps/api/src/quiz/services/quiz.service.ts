import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CourseModuleDocument,
  Module as CourseModuleEntity,
} from 'src/course-modules/schemas/course-module.schema';
import { QuizStatus } from '../../common/enums/quiz-status.enum';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { UpdateQuizDto } from '../dto/update-quiz.dto';
import { Quiz } from '../schema/quiz.schema';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('Quiz') private readonly quizModel: Model<Quiz>,
    @InjectModel(CourseModuleEntity.name)
    private moduleModel: Model<CourseModuleDocument>,
  ) {}

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    try {
      const { title, moduleId } = createQuizDto;

      const existingQuiz = await this.quizModel.findOne({ title, moduleId });

      if (existingQuiz) {
        throw new ConflictException('Ce quiz existe déjà pour ce module');
      }

      // Convert moduleId string to ObjectId for proper MongoDB reference
      const quizData = {
        ...createQuizDto,
        moduleId: new Types.ObjectId(moduleId),
      };

      const quiz = new this.quizModel(quizData);
      return quiz.save();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new InternalServerErrorException('Une erreur est survenue');
      }
    }
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizModel.find().populate('moduleId', 'title').exec();
  }

  async findQuizById(id: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(id).exec();
    if (!quiz) throw new NotFoundException('Quiz introuvable');
    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.quizModel.findByIdAndUpdate(id, updateQuizDto, {
      new: true,
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable');
    return quiz;
  }

  async remove(id: string): Promise<void> {
    const result = await this.quizModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Quiz introuvable');
  }

  async publishQuiz(quizId: string) {
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz introuvable');
    }

    // un quiz doit contenir au moins 4 questions
    if (!quiz.questions || quiz.questions.length < 4) {
      throw new BadRequestException(
        'Le quiz doit contenir au moins 4 questions',
      );
    }

    // au moins deux options
    quiz.questions.forEach((question, index) => {
      if (!question.options || question.options.length < 2) {
        throw new BadRequestException(
          `La question ${index + 1} doit contenir au moins 2 options`,
        );
      }

      // il faut avoir au mois une réponse correct
      const hasCorrect = question.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        throw new BadRequestException(
          `La question ${index + 1} doit avoir au moins une bonne réponse`,
        );
      }
    });

    quiz.status = QuizStatus.PUBLISHED;
    await quiz.save();

    return {
      message: 'Quiz publié avec succès',
      quizId: quiz._id,
    };
  }
}
