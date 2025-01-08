import {
  RouterProvider as LibraryRouterProvider,
  type RouteObject,
  createBrowserRouter
} from 'react-router-dom';

type Properties = {
  routes: RouteObject[];
};

const RouterProvider = ({ routes }: Properties): JSX.Element => (
  <LibraryRouterProvider router={createBrowserRouter(routes)} />
);

export { RouterProvider };
