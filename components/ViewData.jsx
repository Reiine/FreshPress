import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import Spinner from 'react-native-loading-spinner-overlay';
import { List, TextInput, Provider, DefaultTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import DropDown from 'react-native-paper-dropdown';
import firestore from '@react-native-firebase/firestore';

export default function ViewData({ month }) {
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState('This Month');
  const [data, setData] = useState([]);
  const [normalPrice, setNormalPrice] = useState('8');
  const [saariPrice, setSaariPrice] = useState('10');
  const [dhotiPrice, setDhotiPrice] = useState('10');
  const [monthlyData, setMonthlyData] = useState([]);
  const [total, setTotal] = useState(0);
  const ref = useRef();
  const [showDropDown, setShowDropDown] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Adjust collection name as necessary
      const snapshot = await firestore().collection('freshpressdata').get();
      const fetchedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(fetchedData);
      calculateMonthlyData(fetchedData);
    } catch (error) {
      Alert.alert('Error fetching data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthAll = [
    { label: 'This Month', value: 'This Month' },
    { label: 'All', value: 'All' },
  ];

  const calculateMonthlyData = data => {
    const groupedData = data.reduce((acc, item) => {
      const key = `${item.date.year}-${item.date.month}`;
      if (!acc[key]) {
        acc[key] = {
          year: item.date.year,
          month: item.date.month,
          totalNormalQuantity: 0,
          totalSaariQuantity: 0,
          totalDhotiQuantity: 0,
        };
      }
      acc[key].totalNormalQuantity += parseInt(item.normalQuantity);
      if (item.otherType === 2) {
        acc[key].totalSaariQuantity += parseInt(item.otherQuantity);
      } else if (item.otherType === 3) {
        acc[key].totalDhotiQuantity += parseInt(item.otherQuantity);
      }
      return acc;
    }, {});

    const result = Object.values(groupedData);
    setMonthlyData(result);
  };

  const getTotalNormalClothes = () => {
    return data
      .filter(item => item.date.month == month)
      .reduce((acc, item) => acc + parseInt(item.normalQuantity), 0);
  };

  const getTotalSaari = () => {
    const filteredData = data.filter(
      item => item.date.month == month && item.otherType === 2,
    );

    return filteredData.length > 0
      ? filteredData.reduce(
        (acc, item) => acc + parseInt(item.otherQuantity),
        0,
      )
      : 0;
  };

  const getTotalDhoti = () => {
    const filteredData = data.filter(
      item => item.date.month == month && item.otherType === 3,
    );

    return filteredData.length > 0
      ? filteredData.reduce(
        (acc, item) => acc + parseInt(item.otherQuantity),
        0,
      )
      : 0;
  };

  const getTotalNormalPrice = () =>
    getTotalNormalClothes() * parseInt(normalPrice);

  const getTotalSaariPrice = () => {
    const totalSaari = getTotalSaari() || 0;
    return totalSaari * parseInt(saariPrice);
  };

  const getTotalDhotiPrice = () => {
    const totalDhoti = getTotalDhoti() || 0;
    return totalDhoti * parseInt(dhotiPrice);
  };

  const getTotalOtherPrice = () => getTotalDhotiPrice() + getTotalSaariPrice();

  useEffect(() => {
    let monthTotal = 0;
    data.forEach(item => {
      if (item.date.month == month) {
        monthTotal += item.totalPrice;
      }
    });
    setTotal(monthTotal);
  }, [data]);

  const captureScreen = async () => {
    try {
      const uri = await ref.current.capture();
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();
      const time = `${currentDate.getMinutes()}-${currentDate.getSeconds()}`;
      const destinationPath = `${RNFS.PicturesDirectoryPath}/IRONING_BILLS/${day}-${month}-${year} ${time}.jpg`;
      await RNFS.copyFile(uri, destinationPath);
      Alert.alert('Image saved to:', destinationPath);
    } catch (error) {
      console.error('Error capturing screen:', error);
    }
  };

  const formatDate = date => {
    const day = date.day.toString().padStart(2, '0');
    const month = date.month.toString().padStart(2, '0');
    const year = date.year;
    return `${day}-${month}-${year}`;
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
    <Provider theme={theme} >
      <ScrollView style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.headerTxt}>View Data</Text>
        </View>
        {/* <List.Section style={{marginHorizontal: 30, marginTop: 10}} theme={{colors:{background:"black"}}} >
        <List.Accordion
          title={value}
          left={props => <List.Icon {...props} icon="calendar" />}>
          <List.Item
            style={{backgroundColor: 'white'}}
            left={props => (
              <View style={{width:"100%"}}>
                <TouchableOpacity onPress={() => setValue('This Month')} style={{borderWidth:1,padding:10, borderColor:"lightgrey"}}>
                  <Text style={{textAlign:"center", fontSize:15,color:"black"}}>This Month</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setValue('All')} style={{borderWidth:1,padding:10, borderColor:"lightgrey"}}>
                  <Text style={{textAlign:"center", fontSize:15,color:"black"}}>All</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </List.Accordion>
      </List.Section> */}
        <View style={{ marginHorizontal: 30, marginTop: 10 }}>
          <DropDown
            label={value}
            mode={'outlined'}
            visible={showDropDown}
            showDropDown={() => setShowDropDown(true)}
            onDismiss={() => setShowDropDown(false)}
            value={monthAll}
            setValue={setValue}
            list={monthAll}
            dropDownItemTextStyle={{ color: "black" }}
            dropDownItemSelectedTextStyle={{ color: "black" }}
          />
        </View>

        <List.Section style={{ marginHorizontal: 30, marginBottom: 10 }}>
          <List.Accordion
            title="Change Prices"
            left={props => <List.Icon {...props} icon="cash" />}>
            <List.Item
              style={{ backgroundColor: 'white' }}
              left={props => (
                <View style={styles.priceContainer}>
                  <TextInput
                    label={'Clothes'}
                    mode="outlined"
                    style={[styles.priceInput]}
                    placeholder="Enter Normal Clothes Price (By default Rs.8)"
                    placeholderTextColor={'gray'}
                    keyboardType="numeric"
                    onChangeText={e => setNormalPrice(e)}
                    value={normalPrice}
                  />
                  <TextInput
                    label={'Dhoti'}
                    mode="outlined"
                    style={styles.priceInput}
                    placeholder="Enter Dhoti Price (By default Rs.10)"
                    placeholderTextColor={'gray'}
                    keyboardType="numeric"
                    onChangeText={e => setDhotiPrice(e)}
                    value={dhotiPrice}
                  />
                  <TextInput
                    label={'Saari'}
                    mode="outlined"
                    style={styles.priceInput}
                    placeholder="Enter Saari Price (By default Rs.10)"
                    placeholderTextColor={'gray'}
                    keyboardType="numeric"
                    onChangeText={e => setSaariPrice(e)}
                    value={saariPrice}
                  />
                </View>
              )}
            />
          </List.Accordion>
        </List.Section>
        <View>
          {isLoading ? (
            <Spinner
              visible={isLoading}
              textStyle={{ color: 'white' }}
              textContent="Loading..."
              animation="fade"
            />
          ) : (
            <View>
              <View
                style={{
                  marginHorizontal: 30,
                  backgroundColor: 'white',
                  borderRadius: 15,
                  shadowColor: '#4A044E',
                  elevation: 5,
                  shadowOpacity: 0.9,
                }}>
                <ViewShot ref={ref} style={{ backgroundColor: "white" }} >
                  {value === 'All' ? (
                    <>
                      <Text style={styles.textTitle}>IRONING</Text>
                      <View style={styles.table}>
                        <View style={styles.tableHeader}>
                          <Text style={styles.tableHeaderText}>MONTH</Text>
                          <Text style={styles.tableHeaderText}>
                            TOTAL PRICE
                          </Text>
                        </View>
                        {monthlyData.map((item, index) => (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCell}>
                              {months[item.month - 1]} {item.year}
                            </Text>
                            <Text style={styles.tableCell}>
                              {item.totalNormalQuantity *
                                parseInt(normalPrice) +
                                item.totalDhotiQuantity * parseInt(dhotiPrice) +
                                item.totalSaariQuantity * parseInt(saariPrice)}
                            </Text>
                          </View>
                        ))}
                        <View
                          style={[
                            styles.tableRow,
                            { borderTopWidth: 1, borderBottomWidth: 1 },
                          ]}>
                          <Text
                            style={[
                              styles.tableCell,
                              styles.totalLabel,
                              { fontSize: 25 },
                            ]}>
                            Total
                          </Text>
                          <Text
                            style={[
                              styles.tableCell,
                              styles.totalAmount,
                              { fontSize: 25 },
                            ]}>
                            {monthlyData.reduce(
                              (acc, item) =>
                                acc +
                                item.totalNormalQuantity *
                                parseInt(normalPrice) +
                                item.totalDhotiQuantity * parseInt(dhotiPrice) +
                                item.totalSaariQuantity * parseInt(saariPrice),
                              0,
                            )}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.textTitle}>
                        IRONING {months[month - 1].toUpperCase()}{' '}
                        {new Date().getFullYear()}
                      </Text>
                      <View style={styles.table}>
                        <View style={styles.tableHeader}>
                          <Text style={styles.tableHeaderText}>DATE</Text>
                          <Text style={styles.tableHeaderText}>
                            NORMAL CLOTHES
                          </Text>
                          {getTotalSaari() !== 0 && (
                            <Text style={styles.tableHeaderText}>SAARI</Text>
                          )}
                          {getTotalDhoti() !== 0 && (
                            <Text style={styles.tableHeaderText}>DHOTI</Text>
                          )}
                        </View>
                        {data
                          .filter(item => item.date.month == month)
                          .map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                              <Text style={styles.tableCell}>
                                {formatDate(item.date)}
                              </Text>
                              <Text style={styles.tableCell}>
                                {item.normalQuantity}
                              </Text>
                              {getTotalSaari() > 0 &&
                                item.otherType === 2 ? (
                                <Text style={styles.tableCell}>
                                  {item.otherQuantity}
                                </Text>
                              ) : (
                                getTotalSaari() > 0 && (
                                  <Text style={styles.tableCell}>-</Text>
                                )
                              )}
                              {getTotalDhoti() > 0 &&
                                item.otherType === 3 ? (
                                <Text style={styles.tableCell}>
                                  {item.otherQuantity}
                                </Text>
                              ) : (
                                getTotalDhoti() > 0 && (
                                  <Text style={styles.tableCell}>-</Text>
                                )
                              )}
                            </View>
                          ))}
                        <View style={[styles.tableRow, { borderTopWidth: 1 }]}>
                          <Text style={styles.tableCell}>Total Clothes</Text>
                          <Text style={styles.tableCell}>
                            {getTotalNormalClothes()}
                          </Text>
                          {getTotalSaari() > 0 && (
                            <Text style={styles.tableCell}>
                              {getTotalSaari()}
                            </Text>
                          )}
                          {getTotalDhoti() > 0 && (
                            <Text style={styles.tableCell}>
                              {getTotalDhoti()}
                            </Text>
                          )}
                        </View>
                        <View style={[styles.tableRow, { borderBottomWidth: 1 }]}>
                          <Text style={styles.tableCell}>Total Price</Text>
                          <Text style={styles.tableCell}>
                            {getTotalNormalClothes()}x{normalPrice} ={' '}
                            {getTotalNormalPrice()}
                          </Text>
                          {getTotalSaari() > 0 && (
                            <Text style={styles.tableCell}>
                              {getTotalSaari()}x{saariPrice} ={' '}
                              {getTotalSaariPrice()}
                            </Text>
                          )}
                          {getTotalDhoti() > 0 && (
                            <Text style={styles.tableCell}>
                              {getTotalDhoti()}x{dhotiPrice} ={' '}
                              {getTotalDhotiPrice()}
                            </Text>
                          )}
                        </View>
                        <View style={styles.tableRow}>
                          <Text
                            style={[
                              styles.tableCell,
                              styles.totalLabel,
                              { fontSize: 25 },
                            ]}>
                            Total
                          </Text>
                          <Text
                            style={[
                              styles.tableCell,
                              styles.totalAmount,
                              { fontSize: 25 },
                            ]}>
                            {getTotalNormalPrice() + getTotalOtherPrice()}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </ViewShot>
              </View>
              <TouchableOpacity
                style={styles.pdfBtn}
                activeOpacity={0.8}
                onPress={captureScreen}>
                <Text
                  style={{
                    fontSize: 20,
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Capture Screen
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fbfdfc',
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: 40,
    marginTop: 20,
    color: 'black',
  },
  textTitle: {
    textAlign: 'center',
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 20,
  },
  header: {
    backgroundColor: '#67d991',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTxt: {
    textAlign: 'center',
    fontSize: 45,
    color: '#0a0f0c',
    fontFamily: 'Wittgenstein-Bold',
  },
  table: {
    width: '100%',
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: 'gray',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    color: 'black',
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'green',
  },
  pdfBtn: {
    backgroundColor: '#58b67a',
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 40,
    borderRadius: 15,
  },
  toggleButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  toggleButtonText: {
    color: 'grey',
    fontSize: 15,
    marginLeft: 15,
  },
  priceContainer: {
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 30,
    marginHorizontal: 30,
  },
  priceInput: {
    width: 85,
    textAlign: 'center',
  },
  priceLabel: {
    color: 'grey',
  },
  margin: {
    marginHorizontal: 40,
  },
});
