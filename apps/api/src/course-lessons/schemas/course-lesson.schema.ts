import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export enum LessonContentType {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
}

export type CourseLessonDocument = HydratedDocument<CourseLesson>;

@Schema({ timestamps: true })
export class CourseLesson {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'CourseModule',
    required: true,
    index: true,
  })
  moduleId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  order: number;

  @Prop({ required: true, type: String, enum: LessonContentType })
  type: LessonContentType;

  @Prop({ required: true })
  contentUrl: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isPreview: boolean;

  /**
   * Métadonnées extensibles pour stocker des informations supplémentaires
   * Pour VIDEO: { duration: 300 } // durée en secondes
   * Pour PDF: { pageCount: 50, size: 1024 } // taille en KB
   */
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CourseLessonSchema = SchemaFactory.createForClass(CourseLesson);

/**
 * Index composé pour optimiser les requêtes :
 * - Récupération des lessons d'un module triées par ordre
 */
CourseLessonSchema.index({ moduleId: 1, order: 1 });

/**
 * Index pour rechercher rapidement les lessons actives
 */
CourseLessonSchema.index({ isActive: 1 });
