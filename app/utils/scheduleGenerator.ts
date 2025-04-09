interface Porteiro {
  name: string;
  canWorkTuesday: boolean;
  canWorkSaturday: boolean;
}

interface ScheduleEntry {
  day: number;
  people: string[];
}

export function generateSchedule(
  people: Porteiro[],
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
      // Filter people based on day availability
      const availablePeople = people.filter((p) =>
        dayOfWeek === 2 ? p.canWorkTuesday : p.canWorkSaturday
      );

      if (availablePeople.length < 2) {
        // Skip if we don't have enough available people
        continue;
      }

      // Select 2 people for each service
      const peopleForDay = [
        availablePeople[currentPersonIndex % availablePeople.length].name,
        availablePeople[(currentPersonIndex + 1) % availablePeople.length].name,
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
