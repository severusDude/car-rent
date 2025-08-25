import { faker } from "@faker-js/faker";

export type User = {
  name: string;
  email: string;
  avatarUrl: string;
  updatedAt: Date;
};

function createUser(count: number) {
  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    users.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatar(),
      updatedAt: faker.date.recent(),
    });
  }

  return users;
}

export const users: User[] = [...createUser(50)];
