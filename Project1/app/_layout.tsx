import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import { SessionProvider } from "./context/SessionContext";
import { BookingProvider } from "./boeking/boekingContext";

const RootLayout = () => {
  return (
    <AuthProvider>
      <SessionProvider>
        <BookingProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="sessies/mijnsessies" options={{ headerShown: false }} />
            <Stack.Screen name="sessies/maaksessie" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="wedstrijden" options={{ headerShown: false }} />
            <Stack.Screen name="sessies/wijzigsessie" options={{ headerShown: false }} />
            <Stack.Screen name="geschiedenis" options={{ headerShown: false }} />
            <Stack.Screen
              name="boeking/serverBoeken"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="boeking/mijnBoekingen"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile/profile"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile/bewerkProfile"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat/MessageDashboard"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat/ChatMessages"
              options={{ headerShown: false }}
            />
          </Stack>
        </BookingProvider>
      </SessionProvider>
    </AuthProvider>
  );
};

export default RootLayout;
