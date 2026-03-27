// ================================================================
// FILE: src/services/impl/YamlParserService.ts
// PURPOSE: Parse and validate YAML exam files.
// DEPENDENCIES: js-yaml, src/types
// ================================================================

import yaml from 'js-yaml';
import type {
  ExamConfig,
  MultipleChoiceQuestion,
  Question,
  SingleChoiceQuestion,
  TrueFalseQuestion,
  TypeAnswerQuestion,
  ValidationError,
} from '../../types';
import { isDifficultyTag } from '../../utils/questionFilter';
import type { IYamlParserService } from '../interfaces';

const TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * YamlParserService implements parsing and schema validation for exams.
 */
export class YamlParserService implements IYamlParserService {
  /**
   * Parse a YAML string into an exam config.
   *
   * @param yamlString - Raw YAML content.
   * @returns Parsed config.
   */
  parse(yamlString: string): ExamConfig {
    const parsed = yaml.load(yamlString);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('YAML did not contain an object at the root.');
    }
    return parsed as ExamConfig;
  }

  /**
   * Validate an exam config and collect all errors and warnings.
   *
   * @param config - Parsed exam configuration.
   * @returns Full validation report.
   */
  validate(config: ExamConfig) {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!config.exam?.title) {
      errors.push({ path: 'exam.title', message: 'Title is required.' });
    }
    if (!config.exam?.description) {
      errors.push({ path: 'exam.description', message: 'Description is required.' });
    }
    if (!config.settings?.timer_mode) {
      errors.push({ path: 'settings.timer_mode', message: 'timer_mode is required.' });
    } else if (!['global', 'per_question'].includes(config.settings.timer_mode)) {
      errors.push({ path: 'settings.timer_mode', message: 'timer_mode must be global or per_question.' });
    }
    if (config.settings?.timer_mode === 'global' && !config.settings.total_time_minutes) {
      errors.push({ path: 'settings.total_time_minutes', message: 'Global timer requires total_time_minutes.' });
    }
    if (config.settings?.timer_mode === 'per_question' && config.settings.total_time_minutes != null) {
      warnings.push({ path: 'settings.total_time_minutes', message: 'total_time_minutes is ignored in per_question mode.' });
    }
    if (!Array.isArray(config.sections) || config.sections.length === 0) {
      errors.push({ path: 'sections', message: 'At least one section is required.' });
    }

    const questionIds = new Set<string>();
    const tagUsage = new Map<string, number>();

    config.sections?.forEach((section, sectionIndex) => {
      if (!section.name) {
        errors.push({ path: `sections[${sectionIndex}].name`, message: 'Section name is required.' });
      }
      if (!Array.isArray(section.questions) || section.questions.length === 0) {
        errors.push({ path: `sections[${sectionIndex}].questions`, message: 'Section must contain questions.' });
        return;
      }

      section.questions.forEach((question, questionIndex) => {
        const basePath = `sections[${sectionIndex}].questions[${questionIndex}]`;
        this.validateQuestion(question, basePath, questionIds, errors, warnings, config.settings.timer_mode, tagUsage);
      });
    });

    if (tagUsage.size === 1) {
      const [onlyTag] = tagUsage.keys();
      warnings.push({ path: 'tags', message: `Exam uses only one unique tag ('${onlyTag}'). Filtering will be limited.` });
    }

    if (
      config.settings?.pass_percentage != null
      && (config.settings.pass_percentage < 0 || config.settings.pass_percentage > 100)
    ) {
      warnings.push({ path: 'settings.pass_percentage', message: 'pass_percentage should be between 0 and 100.' });
    }

    return { errors, warnings, isValid: errors.length === 0 };
  }

  /**
   * Validate one question according to its specific subtype rules.
   */
  private validateQuestion(
    question: Question,
    path: string,
    questionIds: Set<string>,
    errors: ValidationError[],
    warnings: ValidationError[],
    timerMode: ExamConfig['settings']['timer_mode'],
    tagUsage: Map<string, number>,
  ) {
    if (!question.id) {
      errors.push({ path: `${path}.id`, message: 'Question id is required.' });
    } else if (questionIds.has(question.id)) {
      errors.push({ path: `${path}.id`, message: `Duplicate question id: ${question.id}.` });
    } else {
      questionIds.add(question.id);
    }

    if (!question.type) {
      errors.push({ path: `${path}.type`, message: 'Question type is required.' });
    }
    if (!question.question) {
      errors.push({ path: `${path}.question`, message: 'Question text is required.' });
    }
    if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
      errors.push({ path: `${path}.difficulty`, message: 'Question difficulty must be easy, medium, or hard.' });
    }
    if (question.points == null || !Number.isInteger(question.points)) {
      errors.push({ path: `${path}.points`, message: 'Question points must be an integer.' });
    }
    if (question.type !== 'type_answer' && question.points < 1) {
      errors.push({ path: `${path}.points`, message: 'Scored questions must have at least 1 point.' });
    }

    this.validateTags(question, path, errors, warnings, tagUsage);

    if (timerMode === 'global' && question.time_limit_seconds != null) {
      warnings.push({ path: `${path}.time_limit_seconds`, message: 'Per-question time limit is ignored in global timer mode.' });
    }

    if (question.code_snippet && (!question.code_snippet.language || !question.code_snippet.code)) {
      errors.push({ path: `${path}.code_snippet`, message: 'code_snippet requires language and code.' });
    }

    if (question.image) {
      if (!question.image.src) {
        errors.push({ path: `${path}.image.src`, message: 'Image src is required.' });
      }
      if (!question.image.alt) {
        errors.push({ path: `${path}.image.alt`, message: 'Image alt text is required.' });
      }
      if (
        question.image.position
        && !['below_question', 'below_code', 'above_options'].includes(question.image.position)
      ) {
        errors.push({ path: `${path}.image.position`, message: 'Invalid image position.' });
      }
      if (!/^https?:\/\//i.test(question.image.src) && !question.image.src.startsWith('data:')) {
        warnings.push({ path: `${path}.image.src`, message: 'Relative image sources require uploaded files.' });
      }
      if (question.image.position === 'below_code' && !question.code_snippet) {
        warnings.push({ path: `${path}.image.position`, message: 'below_code is most useful when code_snippet exists.' });
      }
    }

    switch (question.type) {
      case 'single_choice':
        this.validateSingleChoice(question, path, errors);
        break;
      case 'multiple_choice':
        this.validateMultipleChoice(question, path, errors);
        break;
      case 'true_false':
        this.validateTrueFalse(question, path, errors);
        break;
      case 'type_answer':
        this.validateTypeAnswer(question, path, errors);
        break;
      default:
        errors.push({ path: `${path}.type`, message: 'Unsupported question type.' });
    }
  }

  private validateTags(
    question: Question,
    path: string,
    errors: ValidationError[],
    warnings: ValidationError[],
    tagUsage: Map<string, number>,
  ) {
    if (!('tags' in question) || question.tags == null) {
      errors.push({ path: `${path}.tags`, message: `Question ${question.id || 'unknown'} is missing tags. Every question must have at least one topic tag.` });
      return;
    }
    if (!Array.isArray(question.tags) || question.tags.length === 0) {
      errors.push({ path: `${path}.tags`, message: `Question ${question.id || 'unknown'} has an empty tags array. Add at least one topic tag.` });
      return;
    }

    question.tags.forEach((tag, index) => {
      if (!TAG_PATTERN.test(tag)) {
        errors.push({ path: `${path}.tags[${index}]`, message: `Question ${question.id || 'unknown'} has invalid tag '${tag}'. Tags must be lowercase kebab-case (e.g., 'fine-tuning', 'css-grid').` });
        return;
      }

      if (isDifficultyTag(tag)) {
        warnings.push({ path: `${path}.tags[${index}]`, message: `Question ${question.id || 'unknown'} has tag '${tag}' which matches a difficulty level. Difficulty should be set via the difficulty field, not in tags.` });
      }

      tagUsage.set(tag, (tagUsage.get(tag) ?? 0) + 1);
    });
  }

  private validateSingleChoice(question: SingleChoiceQuestion, path: string, errors: ValidationError[]) {
    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6) {
      errors.push({ path: `${path}.options`, message: 'Single choice questions need 2 to 6 options.' });
    }
    const optionIds = question.options?.map((option) => option.id) ?? [];
    if (new Set(optionIds).size !== optionIds.length) {
      errors.push({ path: `${path}.options`, message: 'Option ids must be unique within a question.' });
    }
    if (!question.correct_answer) {
      errors.push({ path: `${path}.correct_answer`, message: 'correct_answer is required.' });
    }
    if (question.options && !question.options.some((option) => option.id === question.correct_answer)) {
      errors.push({ path: `${path}.correct_answer`, message: 'correct_answer must match an option id.' });
    }
  }

  private validateMultipleChoice(question: MultipleChoiceQuestion, path: string, errors: ValidationError[]) {
    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6) {
      errors.push({ path: `${path}.options`, message: 'Multiple choice questions need 2 to 6 options.' });
    }
    const optionIds = question.options?.map((option) => option.id) ?? [];
    if (new Set(optionIds).size !== optionIds.length) {
      errors.push({ path: `${path}.options`, message: 'Option ids must be unique within a question.' });
    }
    if (!Array.isArray(question.correct_answers) || question.correct_answers.length < 2) {
      errors.push({ path: `${path}.correct_answers`, message: 'correct_answers must contain at least 2 option ids.' });
      return;
    }
    if (new Set(question.correct_answers).size !== question.correct_answers.length) {
      errors.push({ path: `${path}.correct_answers`, message: 'correct_answers must not contain duplicates.' });
    }
    if (question.correct_answers.some((answerId) => !optionIds.includes(answerId))) {
      errors.push({ path: `${path}.correct_answers`, message: 'Each correct answer must match an option id.' });
    }
  }

  private validateTrueFalse(question: TrueFalseQuestion, path: string, errors: ValidationError[]) {
    if (question.correct_answer !== 'true' && question.correct_answer !== 'false') {
      errors.push({ path: `${path}.correct_answer`, message: 'True/false questions require "true" or "false" as strings.' });
    }
  }

  private validateTypeAnswer(question: TypeAnswerQuestion, path: string, errors: ValidationError[]) {
    if (question.points !== 0) {
      errors.push({ path: `${path}.points`, message: 'type_answer questions must have 0 points.' });
    }
  }
}
