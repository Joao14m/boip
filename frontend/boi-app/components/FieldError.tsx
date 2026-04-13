import { Text } from 'react-native';

type Props = { message?: string };

export function FieldError({ message }: Props) {
  if (!message) return null;
  return (
    <Text style={{ color: '#E53E3E', fontSize: 12, marginTop: 4 }}>
      {message}
    </Text>
  );
}
