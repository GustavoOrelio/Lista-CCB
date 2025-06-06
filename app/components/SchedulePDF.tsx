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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Escala de Porteiros - {month}/{year}
        </Text>
        {entries
          .sort((a, b) => a.day - b.day)
          .map((entry, index) => {
            let people = entry.people;
            if (people.length === 2 && index % 2 === 1) {
              people = [people[1], people[0]];
            }
            return (
              <View key={index} style={styles.entry}>
                <Text style={styles.day}>Dia {entry.day}:</Text>
                <Text style={styles.people}>{people.join(', ')}</Text>
              </View>
            );
          })}
      </Page>
    </Document>
  );
} 