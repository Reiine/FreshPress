import React, { useState, useMemo, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { TextInput, Provider, DefaultTheme } from 'react-native-paper';
import axios from 'axios';
import RadioGroup from 'react-native-radio-buttons-group'; // Correct import
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import Spinner from 'react-native-loading-spinner-overlay'; // Import Spinner
import firestore from '@react-native-firebase/firestore';
import freshpressdata from '../freshpressdata.json';

export default function Home({ navigation, route }) {
  const [normalQuantity, setNormalQuantity] = useState(0);
  const [otherQuantity, setOtherQuantity] = useState(0);
  const [selectedValue, setSelectedValue] = useState(1);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Normal Clothes');
  const { setMonth } = route.params;

  const radioButtons = useMemo(
    () => [
      { id: '1', label: 'None', value: 'None', selected: true },
      { id: '2', label: 'Saari', value: 'Saari' },
      { id: '3', label: 'Dhoti', value: 'Dhoti' },
    ],
    [],
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (normalQuantity) {
        // Default otherQuantity to 0 if not provided
        const dataToSave = {
          normalQuantity: parseInt(normalQuantity),
          otherQuantity: parseInt(otherQuantity) || 0,
          otherType: parseInt(selectedValue),
          date: {
            day: date.getDate(),
            month: date.getMonth() + 1, // JavaScript months are 0-indexed
            year: date.getFullYear(), // Get the full year
          },
        };
  
        // Generate a new document ID or use a specific ID if needed
        const docId = firestore().collection('freshpressdata').doc().id; // Auto-generated ID
  
        // Save data to Firestore
        await firestore().collection('freshpressdata').doc(docId).set(dataToSave);
  
        setIsLoading(false);
        Alert.alert('Success', 'Data saved successfully.');
      } else {
        setIsLoading(false);
        Alert.alert('Error', 'Please enter the quantity of normal clothes.');
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    setMonth(selectedDate.getMonth() + 1);
  };

  const lightTheme = {
    ...DefaultTheme,
    dark: false, // Ensure the theme is not dark
    colors: {
      ...DefaultTheme.colors,
      background: '#ffffff', // Set background color to white
      text: '#000000', // Set text color to black
      // Customize other colors as needed
    },
  };
  const theme = lightTheme;



  return (
    <Provider theme={theme} >
      <ScrollView style={styles.scroll}>
        <SafeAreaView style={styles.wrapper}>
          <StatusBar translucent backgroundColor={'transparent'} />
          <View style={styles.header}>
            <Text style={styles.headerTxt}>Home</Text>
          </View>
          <Spinner visible={isLoading} textStyle={styles.spinnerTextStyle} />
          <View style={styles.viewWrap}>
            <Text style={[styles.innerText, { marginTop: 0 }]}>Select Date:</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateInput}>
              <Text style={styles.dateText}>{date.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                onChange={handleDateChange}
                style={styles.datePicker}
              />
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.optionButton,
                  selectedOption === 'Normal Clothes' && styles.selectedButton,
                  { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
                ]}
                onPress={() => setSelectedOption('Normal Clothes')}>
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === 'Normal Clothes' && styles.activeText,
                  ]}>
                  Normal Clothes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.optionButton,
                  selectedOption === 'Other Clothes' && styles.selectedButton,
                  { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
                ]}
                onPress={() => setSelectedOption('Other Clothes')}>
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === 'Other Clothes' && styles.activeText,
                  ]}>
                  Other Clothes
                </Text>
              </TouchableOpacity>
            </View>
            {selectedOption === 'Normal Clothes' && (
              <>
                <TextInput
                  label={'Enter Quantity'}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.innerText]}
                  onChangeText={value => setNormalQuantity(value)}
                />
              </>
            )}
            {selectedOption === 'Other Clothes' && (
              <>
                <TextInput
                  mode="outlined"
                  label={'Enter Quantity'}
                  keyboardType="numeric"
                  style={styles.input}
                  onChangeText={value => setOtherQuantity(value)}
                />
                <Text style={styles.innerText}>Select Type:</Text>
                <RadioGroup
                  labelStyle={styles.color}
                  radioButtons={radioButtons}
                  onPress={setSelectedValue}
                  selectedId={selectedValue}
                  containerStyle={styles.radioGroup}
                />
              </>
            )}
            <TouchableOpacity
              style={styles.submitBtn}
              activeOpacity={0.8}
              onPress={handleSave}>
              <Text style={styles.btnTxt}>Save</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#fbfdfc',
  },
  wrapper: {
    backgroundColor: '#fbfdfc',
    height: '100%',
  },
  viewWrap: {
    marginHorizontal: 40,
    marginTop: 20,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
  },
  header: {
    backgroundColor: '#67d991',
    height: 200,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  headerTxt: {
    fontSize: 45,
    color: '#0a0f0c',
    fontFamily: 'Wittgenstein-Bold',
  },
  heading: {
    fontSize: 25,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  innerText: {
    fontSize: 18,
    marginTop: 30,
    color: 'black',
  },
  submitBtn: {
    // backgroundColor: '#54ff',
    backgroundColor: '#58b67a',
    display: 'flex',
    padding: 20,
    borderRadius: 15,
    marginTop: 30,
  },
  btnTxt: {
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: 'black',
    marginBottom: 10,
    color: 'black',
    marginTop: 35,
    backgroundColor: 'white',
  },
  dataBtn: {
    backgroundColor: '#ca054d',
    marginTop: 10,
  },
  radioGroup: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'center',
  },
  color: {
    color: 'grey',
  },
  dateInput: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 10,
  },
  dateText: {
    fontSize: 18,
    color: 'black',
  },
  datePicker: {
    borderBottomWidth: 2,
    paddingBottom: 10,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#9cdeb4',
    borderRadius: 15,
    padding: 23,
  },
  selectedButton: {
    // backgroundColor: '#00a2ae',
    backgroundColor: '#58b67a',
  },
  optionText: {
    fontSize: 18,
    color: '#fbfdfc',
  },
  activeText: {
    color: 'white',
  },
});
