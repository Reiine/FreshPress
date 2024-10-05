import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import CheckBox from 'react-native-check-box';
import { Provider, Button, Dialog, Portal, DefaultTheme } from 'react-native-paper';

export default function Edit() {
  const [showDatePicker1, setShowDatePicker1] = useState(false);
  const [showDatePicker2, setShowDatePicker2] = useState(false);
  const [date, setDate] = useState(new Date());
  const [newDate, setNewDate] = useState(new Date());
  const [selectedOption, setSelectedOption] = useState('Change Date');
  const [otherQuantity, setOtherQuantity] = useState(0);
  const [changeDate, setChangeDate] = useState(true);
  const [visible, setVisible] = React.useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const handleEdit = async () => {
  try {
    const collectionRef = firestore().collection('freshpressdata');

    let updateData = {};
    if (selectedOption === 'Change Date') {
      updateData = {
        date: {
          day: newDate.getDate(),
          month: newDate.getMonth() + 1,
          year: newDate.getFullYear(),
        },
        otherQuantity, // Optional, update if needed
        changeDate,
      };
    } else if (selectedOption === 'Change Quantity') {
      updateData = {
        normalQuantity: parseInt(otherQuantity), // Field to be updated
        changeDate,
      };
    }


    // Query to find the document(s) to update
    const snapshot = await collectionRef
      .where('date', '==', {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      })
      .get();

    if (snapshot.empty) {
      Alert.alert('No matching documents found.');
      return;
    }

    snapshot.forEach(doc => {
      doc.ref.update(updateData)
        .then(() => {
          console.log('Document successfully updated!');
          Alert.alert('Edit successful');
        })
        .catch(error => {
          console.error('Error updating document:', error);
          Alert.alert('Error updating record:', error.message);
        });
    });

  } catch (error) {
    console.error('Error in handleEdit:', error);
    Alert.alert('Error editing record:', error.message);
  }
};


const handleDelete = async () => {
  try {
    const collectionRef = firestore().collection('freshpressdata');
    const snapshot = await collectionRef
      .where('date', '==', {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      })
      .limit(1) 
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]; 
      await doc.ref.delete(); 
      Alert.alert('Delete successful');
    } else {
      Alert.alert('No records found to delete');
    }
  } catch (error) {
    Alert.alert('Error deleting record:', error.message);
  }
};


  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker1(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleNewDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newDate;
    setShowDatePicker2(Platform.OS === 'ios');
    setNewDate(currentDate);
  };

  const handleDialog = () => {
    hideDialog();
    handleDelete();
  };

  const lightTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      background: '#ffffff',
      text: '#000000',
    },
  };
  const theme = lightTheme;

  return (
    <Provider theme={theme}>
      <ScrollView style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.headerTxt}>Edit</Text>
        </View>
        <View style={styles.wrapView}>
          <Text style={styles.innerText}>Select Date You Want To Change:</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker1(true)}
            style={styles.dateInput}>
            <Text style={styles.dateText}>{date.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker1 && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              style={styles.datePicker}
            />
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.optionButton,
                selectedOption === 'Change Date' && styles.selectedButton,
                { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
              ]}
              onPress={() => setSelectedOption('Change Date')}>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === 'Change Date' && styles.activeText,
                ]}>
                Change Date
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.optionButton,
                selectedOption === 'Change Quantity' && styles.selectedButton,
                {
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              ]}
              onPress={() => setSelectedOption('Change Quantity')}>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === 'Change Quantity' && styles.activeText,
                ]}>
                Change Quantity
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.optionButton,
                styles.delete,
                selectedOption === 'Delete' && [
                  styles.selectedButton,
                  styles.deleteActive,
                  { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
                ],
              ]}
              onPress={() => setSelectedOption('Delete')}>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === 'Delete' && styles.activeText,
                ]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
          {selectedOption === 'Change Date' && (
            <>
              <TouchableOpacity
                onPress={() => setShowDatePicker2(true)}
                style={[styles.dateInput, { marginTop: 30 }]}>
                <Text style={styles.dateText}>{newDate.toDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker2 && (
                <DateTimePicker
                  value={newDate}
                  mode="date"
                  display="default"
                  onChange={handleNewDateChange}
                  style={styles.datePicker}
                />
              )}
              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.8}
                onPress={handleEdit}>
                <Text style={styles.btnTxt}>Save</Text>
              </TouchableOpacity>
            </>
          )}
          {selectedOption === 'Change Quantity' && (
            <>
              <TextInput
                mode="outlined"
                label={'Enter Quantity'}
                keyboardType="numeric"
                style={[styles.input, styles.innerText]}
                onChangeText={value => setOtherQuantity(value)}
              />
              <CheckBox
                style={styles.checkBox}
                onClick={() => setChangeDate(!changeDate)}
                isChecked={changeDate}
                leftText={'Change the date as well?'}
                checkedCheckBoxColor="#0a0f0c"
                leftTextStyle={{ color: 'grey' }}
              />
              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.8}
                onPress={handleEdit}>
                <Text style={styles.btnTxt}>Save</Text>
              </TouchableOpacity>
            </>
          )}
          {selectedOption === 'Delete' && (
            <>
              <Text style={[styles.innerText, { textAlign: "center" }]}>
                You have selected to delete this entry.{"\n"}
                {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}
              </Text>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: 'red' }]}
                activeOpacity={0.8}
                onPress={showDialog}>
                <Text style={styles.btnTxt}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Content >
              <Text style={{ color: "black" }}>
                Are you sure you want to delete data assosiated with the date:{' '}
                {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Cancel</Button>
              <Button onPress={handleDialog}>Ok</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fbfdfc',
  },
  header: {
    backgroundColor: '#67d991',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  headerTxt: {
    textAlign: 'center',
    fontSize: 45,
    color: '#0a0f0c',
    fontFamily: 'Wittgenstein-Bold',
  },
  wrapView: {
    marginHorizontal: 40,
  },
  innerText: {
    fontSize: 18,
    marginTop: 30,
    color: 'black',
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
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    alignContent: 'center',
  },
  optionButton: {
    backgroundColor: '#9cdeb4',
    borderRadius: 15,
    paddingVertical: 25,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: '#58b67a',
  },
  optionText: {
    fontSize: 18,
    color: '#fbfdfc',
    width: 100,
    textAlign: 'center',
  },
  activeText: {
    color: 'white',
  },
  submitBtn: {
    backgroundColor: '#58b67a',
    display: 'flex',
    padding: 20,
    borderRadius: 10,
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
  },
  checkBox: {
    marginTop: 20,
  },
  deleteActive: {
    backgroundColor: 'red',
  },
  delete: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
});
