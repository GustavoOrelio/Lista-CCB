interface Porteiro {
  name: string;
  canWorkTuesday: boolean;
  canWorkSaturday: boolean;
  serviceCount: number;
}

interface ScheduleEntry {
  day: number;
  people: string[];
}

function getAvailablePeople(people: Porteiro[], dayOfWeek: number): Porteiro[] {
  return people.filter((p) =>
    dayOfWeek === 2 ? p.canWorkTuesday : p.canWorkSaturday
  );
}

function selectPeopleForDay(availablePeople: Porteiro[]): Porteiro[] {
  if (availablePeople.length < 2) return [];

  // Ordena por número de serviços (menos serviços primeiro)
  const sortedPeople = [...availablePeople].sort(
    (a, b) => a.serviceCount - b.serviceCount
  );

  // Pega os dois com menos serviços
  const selectedPeople = sortedPeople.slice(0, 2);

  // Atualiza o contador de serviços
  selectedPeople.forEach((p) => p.serviceCount++);

  return selectedPeople;
}

export function generateSchedule(
  people: Porteiro[],
  month: number,
  year: number
): ScheduleEntry[] {
  if (people.length === 0) return [];

  // Reset service counts for new month
  people.forEach((p) => (p.serviceCount = 0));

  const entries: ScheduleEntry[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // 2 = Tuesday, 6 = Saturday
    if (dayOfWeek === 2 || dayOfWeek === 6) {
      const availablePeople = getAvailablePeople(people, dayOfWeek);
      const selectedPeople = selectPeopleForDay(availablePeople);

      if (selectedPeople.length === 2) {
        entries.push({
          day,
          people: selectedPeople.map((p) => p.name),
        });
      }
    }
  }

  return entries;
}
