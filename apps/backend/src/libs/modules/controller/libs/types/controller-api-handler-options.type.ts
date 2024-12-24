type DefaultApiHandlerOptions = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
  user?: unknown;
};

type ControllerAPIHandlerOptions<
  T extends DefaultApiHandlerOptions = DefaultApiHandlerOptions
> = {
  body: T['body'];
  params: T['params'];
  query: T['query'];
  user: T['user'];
};

export { type ControllerAPIHandlerOptions };
