import { AuthMiddleware } from './auth.middleware';
import { Request, Response, NextFunction } from 'express';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new AuthMiddleware();
    req = { headers: {}, method: 'GET', path: '/test' };
    res = {};
    next = jest.fn();
    console.log = jest.fn();
  });

  it('should log the request method and path', () => {
    middleware.use(req as Request, res as Response, next);

    expect(console.log).toHaveBeenCalledWith('Request... Method: GET, Path: /test');
    expect(next).toHaveBeenCalled();
  });

  it('should extract the token from Authorization header', () => {
    req.headers['authorization'] = 'Bearer validToken';

    middleware.use(req as Request, res as Response, next);

    expect(req['token']).toBe('validToken');
    expect(next).toHaveBeenCalled();
  });

  it('should not set token if Authorization header is missing', () => {
    middleware.use(req as Request, res as Response, next);

    expect(req['token']).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should not set token if Authorization header is malformed', () => {
    req.headers['authorization'] = 'InvalidFormatToken';

    middleware.use(req as Request, res as Response, next);

    expect(req['token']).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
