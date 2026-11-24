import type { Service, User } from './types';

export function sortByDateTime(services: Service[]): Service[] {
  return [...services].sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
  );
}

export function teamFor(service: Service, users: User[]): User[] {
  return service.assignments
    .map((assignment) => users.find((user) => user.id === assignment.userId))
    .filter((user): user is User => Boolean(user));
}

export function myAssignment(service: Service, userId: string | null | undefined) {
  if (!userId) return undefined;
  return service.assignments.find((assignment) => assignment.userId === userId);
}
