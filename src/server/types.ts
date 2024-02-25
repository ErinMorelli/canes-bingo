import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export type GetSquaresQuery = {
  include?: string
  exclude?: string;
  category_id?: string;
};

export interface SquareTable {
  squareId: Generated<number>;
  content: string;
}
export type NewSquare = Insertable<SquareTable>;
export type SquareUpdate = Updateable<SquareTable>;

export interface CategoryTable {
  categoryId: Generated<number>;
  groupId: number;
  name: string;
  label: string;
  isDefault: boolean;
}
export type NewCategory = Insertable<CategoryTable>;
export type CategoryUpdate = Updateable<CategoryTable>;

export interface GroupTable {
  groupId: Generated<number>;
  name: string;
  label: string;
  description: string;
}
export type Group = Selectable<GroupTable>;
export type NewGroup = Insertable<GroupTable>;
export type GroupUpdate = Updateable<GroupTable>;

export interface SquareCategoryTable {
  id: Generated<number>;
  squareId: number;
  categoryId: number;
}

export interface ConfigTable {
  id: Generated<number>;
  key: string;
  value: string;
}
export type Config = Selectable<ConfigTable>;
export type NewConfig = Insertable<ConfigTable>;
export type ConfigUpdate = Updateable<ConfigTable>;

export interface UserTable {
  userId: Generated<number>;
  username: string;
  password: string;
}
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type AuthRequest = Omit<User, 'userId'>;

export interface Database {
  squares: SquareTable;
  groups: GroupTable;
  categories: CategoryTable;
  squareCategories: SquareCategoryTable;
  config: ConfigTable;
  users: UserTable;
}

declare module 'express-session' {
  interface SessionData {
    user?: {
      userId: number;
      username: string;
    }
  }
}
