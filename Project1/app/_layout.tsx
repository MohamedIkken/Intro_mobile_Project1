import { Stack } from "expo-router";
import { SessionProvider } from "./SessionContext";

const RootLayout = () => {
  return (

    <SessionProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" /> {/* registratie scherm*/}
        <Stack.Screen name="gamelijst" options={{ headerShown: false }} />
        <Stack.Screen name="maaksessie" options={{ headerShown: false }} />
      </Stack>
    </SessionProvider>
  );
}

export default RootLayout;