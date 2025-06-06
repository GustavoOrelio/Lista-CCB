import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface ScheduleEntry {
  day: number;
  people: string[];
}

interface SchedulePDFProps {
  entries: ScheduleEntry[];
  month: string;
  year: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  entry: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  day: {
    width: '20%',
    fontSize: 12,
  },
  people: {
    width: '80%',
    fontSize: 12,
  },
});

export default function SchedulePDF({ entries, month, year }: SchedulePDFProps) {
  const monthNum = parseInt(month, 10);
  // Agrupa entradas por dia para identificar domingos duplicados
  const grouped = entries
    .sort((a, b) => a.day - b.day)
    .reduce((acc: Record<number, ScheduleEntry[]>, entry) => {
      if (!acc[entry.day]) acc[entry.day] = [];
      acc[entry.day].push(entry);
      return acc;
    }, {});
  // Gera lista final alternando porteiros e marcando RDJ
  const finalList: { day: number; label: string; people: string[] }[] = [];
  Object.entries(grouped).forEach(([dayStr, dayEntries]) => {
    const day = parseInt(dayStr, 10);
    const date = new Date(year, monthNum - 1, day);
    const isDomingo = date.getDay() === 0;
    dayEntries.forEach((entry, idx) => {
      let label = '';
      if (isDomingo) {
        label = idx === 0 ? 'Domingo (RDJ)' : 'Domingo';
      } else {
        // Você pode ajustar para outros dias da semana se quiser
        label = date.toLocaleDateString('pt-BR', { weekday: 'long' });
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }
      finalList.push({ day, label, people: entry.people });
    });
  });
  // Alterna porteiros a cada linha
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Escala de Porteiros - {month}/{year}
        </Text>
        {finalList
          .sort((a, b) => a.day - b.day || a.label.localeCompare(b.label))
          .map((entry, index) => {
            let people = entry.people;
            if (people.length === 2 && index % 2 === 1) {
              people = [people[1], people[0]];
            }
            return (
              <View key={index} style={styles.entry}>
                <Text style={styles.day}>
                  {entry.day.toString().padStart(2, '0')}/
                  {month.padStart(2, '0')} {entry.label}:
                </Text>
                <Text style={styles.people}>{people.join(', ')}</Text>
              </View>
            );
          })}
      </Page>
    </Document>
  );
} 