import { VideoInputDto } from '../dto/video.input-dto';
import { ValidationError } from '../types/validationError';
import { Resolution } from '../types/video';

export const videoInputDtoValidation = (
  data: VideoInputDto,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (
    !data.title ||
    typeof data.title !== 'string' ||
    data.title.trim().length > 40
  ) {
    errors.push({ field: 'title', message: 'Invalid title' });
  }

  if (
    !data.author ||
    typeof data.author !== 'string'
  ) {
    errors.push({ field: 'author', message: 'Invalid author' });
  }

  if (data.canBeDownloaded && typeof data.canBeDownloaded !== 'boolean') {
    errors.push({
      field: 'canBeDownloaded',
      message: 'Invalid canBeDownloaded',
    });
  }

  if (
    (data.minAgeRestriction && typeof data.minAgeRestriction === 'number' &&
      (data.minAgeRestriction > 18 || data.minAgeRestriction < 1))
  ) {
    errors.push({
      field: 'minAgeRestriction',
      message: 'Invalid minAgeRestriction',
    });
  }

    if (data.publicationDate && typeof data.publicationDate !== 'string' ||
    Number(data.createdAt) > Number(resolvePublicationDate(new Date(data.publicationDate)))) {
      errors.push({
        field: 'publicationDate',
        message: 'Invalid publicationDate',
      });
    }

  if (!data.availableResolutions || !Array.isArray(data.availableResolutions)) {
    errors.push({
      field: 'availableResolutions',
      message: 'availableResolutions must be array',
    });
  } else if (data.availableResolutions.length) {
    const existingResolutions = Object.values(Resolution);
    if (
      data.availableResolutions.length > existingResolutions.length ||
      data.availableResolutions.length < 1
    ) {
      errors.push({
        field: 'availableResolutions',
        message: 'Invalid availableResolutions',
      });
    }
    for (const resolution of data.availableResolutions) {
      if (!existingResolutions.includes(resolution)) {
        errors.push({
          field: 'resolution',
          message: 'Invalid resolution:' + resolution,
        });
        break;
      }
    }
  }

  return errors;
};

export function resolvePublicationDate(date:Date): string{
  let addition = 24*60*60*1000;
  let oneDayLater = date.getTime() +addition;
  return new Date(oneDayLater).toISOString();
}
