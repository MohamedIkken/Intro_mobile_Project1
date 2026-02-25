import { Stack } from "expo-router";
import { SessionProvider } from "./SessionContext";

const RootLayout = () => {
  return (
    <SessionProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="gamelijst" options={{ headerShown: false }} />
        <Stack.Screen name="maaksessie" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      </Stack>
    </SessionProvider>
  );
}

export default RootLayout;