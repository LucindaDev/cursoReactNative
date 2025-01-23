import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Pressable} from 'react-native';
import cat from './assets/cat.jpg'

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image source={cat} style={{ 
        width: 200, 
        height: 220
        }} />
      <Text style={{color:'#fff'}}>LUCINDAPP</Text>
      <Pressable style={{backgroundColor:'red', width: 150, height:150, borderRadius: 100, alignItems: 'center', justifyContent: 'center'}} onPress={() => alert('Hello World!')}>
        <Text>Presiona aquí</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181C14',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
