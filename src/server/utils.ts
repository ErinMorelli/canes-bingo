import { NoResultError } from 'kysely';
import Joi from 'joi';

export function handleError(res: any, e: Error) {
  if (e instanceof NoResultError) {
    return res.status(404).json({ message: 'Not Found' });
  }
  if (e instanceof Joi.ValidationError) {
    const message = e.details
      .map((d) => ({ [d.path[0]]: d.message }))
      .reduce(
        (r, c) => Object.assign(r, c),
        {},
      );
    return res.status(400).json(message);
  }
  if (e.name === 'SyntaxError') {
    return res.status(400).json({ message: 'Bad Request' });
  }
  console.error(e);
  return res.status(500).json({ message: 'Server Error' });
}
