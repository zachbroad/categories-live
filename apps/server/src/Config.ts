export const SERVER_HOST = process.env.SERVER_HOST || '0.0.0.0';
export const SERVER_PORT = Number(process.env.SERVER_PORT) || 3000;

export const APPLICATION_TITLE = 'Categories.LIVE';
export const MOTD = 'Welcome to Categories.LIVE!';

export const DB_CONFIG = {
  USER_TABLE: 'Categories_User',
  ROOM_TABLE: 'Categories_Room',
  GAME_TABLE: 'Categories_Game'
};
