import { View, Text, StyleSheet } from 'react-native';

export default function MyLotsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Meus Lotes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, color: '#2D6A4F' },
});
