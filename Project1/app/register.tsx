import { router } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, TextInput} from "react-native";

export default function RegisterScreen() {
  return (
    <View>
        <Text style={{fontSize: 25, textAlign: "center", marginTop: 100}}>Sign up</Text>
        <Text style={styles.text}>E-mail</Text>
        <TextInput style={styles.textInput} placeholder="E-mail"></TextInput>
        <Text style={styles.text}>Password</Text>
        <TextInput style={styles.textInput} placeholder="Password"></TextInput>
        <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back to sign in</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    borderColor: "black",   
    borderWidth: 3,
    width: 330,
    marginLeft: 50,
    marginTop: 10,       
    padding: 5,
    borderRadius: 5
  },
  text: {
    marginLeft: 50, 
    marginTop: 50
  },
  button: {
    marginTop: 60,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "black",  
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  buttonText: {
    color: "black",         
    fontSize: 15,
    fontWeight: "600",
  },
  
})