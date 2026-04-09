import { Router, Request, Response } from 'express';
import { db } from '../../db/videos.db';
import { HttpStatus } from '../../core/types/http-statuses';
import { VideoInputDto } from '../dto/video.input-dto';
import {
  resolvePublicationDate,
  videoInputDtoValidation,
} from '../validation/videoInputDtoValidation';
import { createErrorMessages } from '../../core/utils/error.utils';
import { Video } from '../types/video';

export const videosRouter = Router({});

videosRouter
  .get('', (req: Request, res: Response) => {
    res.status(200).send(db.videos);
  })

  .get('/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const driver = db.videos.find((d) => d.id === Number(id));

    if (!driver) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'Video not found' }]),
        );
      return;
    }
    res.status(200).send(driver);
  })
  .post('', (req: Request<{}, {}, VideoInputDto>, res: Response) => {
    const errors = videoInputDtoValidation(req.body);

    if (errors.length > 0) {
      res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
      return;
    }

    const newVideo: Video = {
      id: db.videos.length ? db.videos[db.videos.length - 1].id + 1 : 1,
      title: req.body.title,
      author: req.body.author,
      canBeDownloaded: req.body.canBeDownloaded ?? false,
      minAgeRestriction: req.body.minAgeRestriction,
      availableResolutions: req.body.availableResolutions,
      createdAt: new Date().toISOString(),
      publicationDate: resolvePublicationDate(new Date()),
    };
    db.videos.push(newVideo);
    res.status(HttpStatus.Created).send(newVideo);
  })

  .put('/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const index = db.videos.findIndex((v) => v.id === id);

    if (index === -1) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'Video not found' }]),
        );
      return;
    }
    const driver = db.videos[index];

    const errors = videoInputDtoValidation({...req.body, createdAt: driver.createdAt});

    if (errors.length > 0) {
      res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
      return;
    }


    driver.title = req.body.title;
    driver.author = req.body.author;
    driver.canBeDownloaded = req.body.canBeDownloaded;
    driver.minAgeRestriction = req.body.minAgeRestriction;
    driver.publicationDate = req.body.publicationDate;
    driver.availableResolutions = req.body.availableResolutions;

    res.sendStatus(HttpStatus.NoContent);
  })

  .delete('/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);

    //ищет первый элемент, у которого функция внутри возвращает true и возвращает индекс этого элемента в массиве, если id ни у кого не совпал, то findIndex вернёт -1.
    const index = db.videos.findIndex((v) => v.id === id);

    if (index === -1) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'Vehicle not found' }]),
        );
      return;
    }

    db.videos.splice(index, 1);
    res.sendStatus(HttpStatus.NoContent);
  });
