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
    data.title.trim().length < 2 ||
    data.title.trim().length > 15
  ) {
    errors.push({ field: 'title', message: 'Invalid title' });
  }

  if (
    !data.author ||
    typeof data.author !== 'string' ||
    data.author.trim().length < 2 ||
    data.author.trim().length > 15
  ) {
    errors.push({ field: 'author', message: 'Invalid author' });
  }

  if (typeof data.canBeDownloaded !== 'boolean') {
    errors.push({
      field: 'canBeDownloaded',
      message: 'Invalid canBeDownloaded',
    });
  }

  if (
    !data.minAgeRestriction ||
    (typeof data.minAgeRestriction === 'number' &&
      (data.minAgeRestriction > 18 || data.minAgeRestriction < 1))
    // typeof data.minAgeRestriction !== null
  ) {
    errors.push({
      field: 'minAgeRestriction',
      message: 'Invalid minAgeRestriction',
    });
  }

  //   if (!data.createdAt || typeof data.createdAt !== 'string') {
  //     errors.push({ field: 'createdAt', message: 'Invalid createdAt' });
  //   }

  //   if (!data.publicationDate || typeof data.publicationDate !== 'string') {
  //     errors.push({
  //       field: 'publicationDate',
  //       message: 'Invalid publicationDate',
  //     });
  //   }

  if (!Array.isArray(data.availableResolutions)) {
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
