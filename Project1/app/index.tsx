import { Text, TextInput, View , StyleSheet, TouchableOpacity} from "react-native";
import { router, Router } from "expo-router";

const Index = () => {
  return (
    <View>
      <Text style={{fontSize: 45, textAlign: "center", marginTop: 60}}>Playnode</Text>
      <Text style={{fontSize: 25, textAlign: "center", marginTop: 100}}>Sign in</Text>
      <Text style={styles.text}>E-mail</Text>
      <TextInput style={styles.textInput} placeholder="E-mail"></TextInput>
      <Text style={styles.text}>Password</Text>
      <TextInput style={styles.textInput} placeholder="Password"></TextInput>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push("/register")}>
        <Text style={styles.buttonText}>No account? Sign up here!</Text>
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

export default Index;