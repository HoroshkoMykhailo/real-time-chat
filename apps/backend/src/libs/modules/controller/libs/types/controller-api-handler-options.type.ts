type DefaultApiHandlerOptions = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

type ControllerAPIHandlerOptions<
  T extends DefaultApiHandlerOptions = DefaultApiHandlerOptions
> = {
  body: T['body'];
  params: T['params'];
  query: T['query'];
};

export { type ControllerAPIHandlerOptions };
