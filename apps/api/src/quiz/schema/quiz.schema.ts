import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QuestionType } from 'src/common/enums/question-type.enum';
import { QuizStatus } from 'src/common/enums/quiz-status.enum';

// schema du options
@Schema({ _id: true })
export class Option {
  _id: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  isCorrect: boolean;
}
export const OptionSchema = SchemaFactory.createForClass(Option);

// schema du questions

@Schema({ _id: true })
export class Question {
  _id: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ type: String, enum: QuestionType, default: QuestionType.QCM })
  type: QuestionType;

  @Prop({ type: [OptionSchema], default: [] })
  options: Option[];
}
export const QuestionSchema = SchemaFactory.createForClass(Question);

// schema du quiz
@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Module' })
  moduleId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, min: 0, max: 100 })
  passingScore: number;

  @Prop({ default: 0 })
  timeLimit: number;

  @Prop({ default: false })
  shuffleQuestions: boolean;

  @Prop({ default: true })
  showResultsImmediately: boolean;

  @Prop({ type: String, enum: QuizStatus, default: QuizStatus.DRAFT })
  status: QuizStatus;

  @Prop({ type: [QuestionSchema], default: [] })
  questions: Question[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

QuizSchema.index({ title: 1, moduleId: 1 }, { unique: true });
