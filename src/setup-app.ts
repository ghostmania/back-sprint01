import express, { Express } from 'express';
import { videosRouter } from './videos/routers/videos.routers';
import { setupSwagger } from './core/swagger/setup-swagger';
import { testingRouter } from './testing/routers/testing.router';

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса

  // основной роут
  app.get('/', (req, res) => {
    res.status(200).send('Hello world!');
  });

  app.use('/videos', videosRouter);
  app.use('/testing', testingRouter);

  setupSwagger(app);
  return app;
};
