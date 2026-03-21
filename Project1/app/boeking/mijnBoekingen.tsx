import { View, Text, ActivityIndicator } from "react-native";
import { useFonts, Orbitron_700Bold } from "@expo-google-fonts/orbitron";

export default function MijnBoekingen() {
  const [fontsLoaded] = useFonts({
    Orbitron_700Bold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>Mijn boekingen</Text>
    </View>
  );
}
