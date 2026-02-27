import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizAttemptService } from './quiz-attempt.service';

@Controller('quiz-attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizAttemptController {
  constructor(private readonly quizAttemptService: QuizAttemptService) {}

  //démarrer le quiz (retourner les questions)
  @Get('quiz/:quizId/start')
  @Roles(Role.Apprenant)
  startQuiz(
    @Param('quizId') quizId: string,
    @CurrentUser('userId') studentId: string,
  ) {
    return this.quizAttemptService.startQuiz(studentId, quizId);
  }

  // Soumettre le quiz
  @Post('quiz/:quizId/submit')
  @Roles(Role.Apprenant)
  @HttpCode(HttpStatus.CREATED)
  submitQuiz(
    @Param('quizId') quizId: string,
    @CurrentUser('userId') studentId: string,
    @Body() submitQuizDto: SubmitQuizDto,
  ) {
    return this.quizAttemptService.submitQuiz(studentId, quizId, submitQuizDto);
  }

  @Get(':attemptId/results')
  @Roles(Role.Apprenant)
  getResults(
    @Param('attemptId') attemptId: string,
    @CurrentUser('userId') studentId: string,
  ) {
    return this.quizAttemptService.getAttemptResults(attemptId, studentId);
  }

  // Historique
  @Get('quiz/:quizId/history')
  @Roles(Role.Apprenant)
  getHistory(
    @Param('quizId') quizId: string,
    @CurrentUser('userId') studentId: string,
  ) {
    return this.quizAttemptService.getAttemptHistory(studentId, quizId);
  }

  // Statistique formateur
  @Get('quiz/:quizId/statistics')
  @Roles(Role.Formateur)
  getStatistics(@Param('quizId') quizId: string) {
    return this.quizAttemptService.getQuizStatistics(quizId);
  }
}
