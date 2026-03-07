import { Stack } from "expo-router";
import { AuthProvider } from "./AuthContext";
import { SessionProvider } from "./SessionContext";

const RootLayout = () => {
  return (
    <AuthProvider>
      <SessionProvider>
        <Stack>
          <Stack.Screen name="index"  options={{ headerShown: false }} />
          <Stack.Screen name="register"  options={{ headerShown: false }} /> 
          <Stack.Screen name="mijnsessies" options={{ headerShown: false }} />
          <Stack.Screen name="maaksessie" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        </Stack>
      </SessionProvider>
    </AuthProvider>
  );
}

export default RootLayout;  