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
    res.status(HttpStatus.Ok).send(db.videos);
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
    res.status(HttpStatus.Ok).send(driver);
  })
  .post('', (req: Request<{}, {}, VideoInputDto>, res: Response) => {
    const errors = videoInputDtoValidation(req.body);

    if (errors.length > 0) {
      res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
      return;
    }
    let date = Date.now();

    const newVideo: Video = {
      id: db.videos.length ? db.videos[db.videos.length - 1].id + 1 : 1,
      title: req.body.title,
      author: req.body.author,
      canBeDownloaded: req.body.canBeDownloaded ?? false,
      minAgeRestriction: req.body.minAgeRestriction ?? null,
      availableResolutions: req.body.availableResolutions,
      createdAt: new Date(date).toISOString(),
      publicationDate: resolvePublicationDate(date),
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
    const id = Number(req.params.id);

    const index = db.videos.findIndex((v) => v.id === id);

    if (index === -1) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'Video not found' }]),
        );
      return;
    }

    db.videos.splice(index, 1);
    res.sendStatus(HttpStatus.NoContent);
  });
