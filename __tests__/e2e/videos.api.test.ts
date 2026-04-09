import request from 'supertest';
import express from 'express';
import { setupApp } from '../../src/setup-app';
import { HttpStatus } from '../../src/core/types/http-statuses';

describe('Videos API', () => {
  const app = express();
  setupApp(app);
  const isoDateTimeRegex =
    /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

  const validVideoInput = {
    title: 'How to test Express APIs',
    author: 'Ghostmania',
    availableResolutions: ['P144', 'P720'],
  };

  const createVideo = async () => {
    const response = await request(app)
      .post('/videos')
      .send(validVideoInput)
      .expect(HttpStatus.Created);

    return response.body;
  };

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
  });

  it('should create video with mandatory fields only; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send(validVideoInput)
      .expect(HttpStatus.Created);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('author');
    expect(response.body).toHaveProperty('canBeDownloaded');
    expect(response.body).toHaveProperty('minAgeRestriction');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('publicationDate');
    expect(response.body).toHaveProperty('availableResolutions');

    expect(response.body).toEqual({
      id: expect.any(Number),
      title: validVideoInput.title,
      author: validVideoInput.author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: expect.stringMatching(isoDateTimeRegex),
      publicationDate: expect.stringMatching(isoDateTimeRegex),
      availableResolutions: validVideoInput.availableResolutions,
    });
  });

  it('should return 400 when title is missing; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send({
        author: validVideoInput.author,
        availableResolutions: validVideoInput.availableResolutions,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'title',
          message: expect.any(String),
        },
      ],
    });
  });

  it('should return 400 when author is missing; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send({
        title: validVideoInput.title,
        availableResolutions: validVideoInput.availableResolutions,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'author',
          message: expect.any(String),
        },
      ],
    });
  });

  it('should return 400 when availableResolutions is missing; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send({
        title: validVideoInput.title,
        author: validVideoInput.author,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'availableResolutions',
          message: expect.any(String),
        },
      ],
    });
  });

  it('should return 400 when title is not a string; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send({
        title: 123,
        author: validVideoInput.author,
        availableResolutions: validVideoInput.availableResolutions,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'title',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when mandatory fields contain incorrect values; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send({
        title: 'a'.repeat(41),
        author: '',
        availableResolutions: [],
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'title',
          message: expect.any(String),
        },
        {
          field: 'author',
          message: expect.any(String),
        },
        {
          field: 'availableResolutions',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when author is not a string; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send({
        title: validVideoInput.title,
        author: 123,
        availableResolutions: validVideoInput.availableResolutions,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'author',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when availableResolutions is not an array; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send({
        title: validVideoInput.title,
        author: validVideoInput.author,
        availableResolutions: 'P144',
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'availableResolutions',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when availableResolutions is empty; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send({
        title: validVideoInput.title,
        author: validVideoInput.author,
        availableResolutions: [],
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'availableResolutions',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when availableResolutions contains unsupported values; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send({
        title: validVideoInput.title,
        author: validVideoInput.author,
        availableResolutions: ['P144', 'P999'],
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: expect.stringMatching(/resolution|availableResolutions/),
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when canBeDownloaded is not boolean; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send({
        ...validVideoInput,
        canBeDownloaded: 'false',
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'canBeDownloaded',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when minAgeRestriction is outside allowed range; POST /videos', async () => {
    const response = await request(app)
      .post('/videos')
      .send({
        ...validVideoInput,
        minAgeRestriction: 19,
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'minAgeRestriction',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should update video with valid data; PUT /videos/:id', async () => {
    const createdVideo = await createVideo();

    await request(app)
      .put(`/videos/${createdVideo.id}`)
      .send({
        title: 'Updated title',
        author: 'Updated author',
        canBeDownloaded: false,
        minAgeRestriction: 18,
        publicationDate: '2026-04-10T10:00:00.000Z',
        availableResolutions: ['P144', 'P1080'],
      })
      .expect(HttpStatus.NoContent);

    const getResponse = await request(app)
      .get(`/videos/${createdVideo.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual({
      id: createdVideo.id,
      title: 'Updated title',
      author: 'Updated author',
      canBeDownloaded: false,
      minAgeRestriction: 18,
      createdAt: expect.stringMatching(isoDateTimeRegex),
      publicationDate: '2026-04-10T10:00:00.000Z',
      availableResolutions: ['P144', 'P1080'],
    });
  });

  it('should return 404 when trying to update non-existing video; PUT /videos/:id', async () => {
    const response = await request(app)
      .put('/videos/999')
      .send({
        title: 'Updated title',
        author: 'Updated author',
        canBeDownloaded: false,
        minAgeRestriction: 18,
        publicationDate: '2026-04-10T10:00:00.000Z',
        availableResolutions: ['P144'],
      })
      .expect(HttpStatus.NotFound);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'id',
          message: expect.any(String),
        },
      ],
    });
  });

  it('should return 400 when update payload has incorrect field types; PUT /videos/:id', async () => {
    const createdVideo = await createVideo();

    const response = await request(app)
      .put(`/videos/${createdVideo.id}`)
      .send({
        title: 123,
        author: 456,
        canBeDownloaded: 'false',
        minAgeRestriction: 18,
        publicationDate: '2026-04-10T10:00:00.000Z',
        availableResolutions: 'P144',
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'title',
          message: expect.any(String),
        },
        {
          field: 'author',
          message: expect.any(String),
        },
        {
          field: 'canBeDownloaded',
          message: expect.any(String),
        },
        {
          field: 'availableResolutions',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when update payload has incorrect field values; PUT /videos/:id', async () => {
    const createdVideo = await createVideo();

    const response = await request(app)
      .put(`/videos/${createdVideo.id}`)
      .send({
        title: 'a'.repeat(41),
        author: '',
        canBeDownloaded: false,
        minAgeRestriction: 19,
        publicationDate: '2026-04-10T10:00:00.000Z',
        availableResolutions: [],
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'title',
          message: expect.any(String),
        },
        {
          field: 'author',
          message: expect.any(String),
        },
        {
          field: 'minAgeRestriction',
          message: expect.any(String),
        },
        {
          field: 'availableResolutions',
          message: expect.any(String),
        },
      ]),
    );
  });

  it('should return 400 when update payload contains unsupported resolution; PUT /videos/:id', async () => {
    const createdVideo = await createVideo();

    const response = await request(app)
      .put(`/videos/${createdVideo.id}`)
      .send({
        title: 'Updated title',
        author: 'Updated author',
        canBeDownloaded: false,
        minAgeRestriction: 18,
        publicationDate: '2026-04-10T10:00:00.000Z',
        availableResolutions: ['P144', 'P999'],
      })
      .expect(HttpStatus.BadRequest);

    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: expect.stringMatching(/resolution|availableResolutions/),
          message: expect.any(String),
        },
      ]),
    );
  });
});
