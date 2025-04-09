interface ScheduleEntry {
  day: number;
  people: string[];
}

export function generateSchedule(
  people: string[],
  month: number,
  year: number
): ScheduleEntry[] {
  if (people.length === 0) return [];

  const entries: ScheduleEntry[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let currentPersonIndex = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // 2 = Tuesday, 6 = Saturday
    if (dayOfWeek === 2 || dayOfWeek === 6) {
      // Select 2 people for each service
      const peopleForDay = [
        people[currentPersonIndex % people.length],
        people[(currentPersonIndex + 1) % people.length],
      ];

      entries.push({
        day,
        people: peopleForDay,
      });

      // Move to next pair of people
      currentPersonIndex += 2;
    }
  }

  return entries;
}
