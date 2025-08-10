import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/landing.tsx'),
  route('home', 'routes/home.tsx'),
  route('game', 'routes/game.tsx')
] satisfies RouteConfig;
