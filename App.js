// import React, {useState, useEffect, useRef} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import io from 'socket.io-client';
// import Slider from '@react-native-community/slider';

// export default function App() {
//   const [serverAddress, setServerAddress] = useState('');
//   const [connected, setConnected] = useState(false);
//   const [socket, setSocket] = useState(null);
//   const [simulationStatus, setSimulationStatus] = useState('Ready');

//   // Sử dụng useRef để theo dõi giá trị hiện tại mà không gây ra re-render
//   const systolicRef = useRef(120);
//   const diastolicRef = useRef(80);
//   const pulseRef = useRef(72);

//   // State cho UI
//   const [systolic, setSystolic] = useState(120);
//   const [diastolic, setDiastolic] = useState(80);
//   const [pulse, setPulse] = useState(72);

//   const [isDragging, setIsDragging] = useState(false);
//   const simulationIntervalRef = useRef(null);

//   useEffect(() => {
//     return () => {
//       if (socket) socket.disconnect();
//       clearSimulationInterval();
//     };
//   }, [socket]);

//   const clearSimulationInterval = () => {
//     if (simulationIntervalRef.current) {
//       clearInterval(simulationIntervalRef.current);
//       simulationIntervalRef.current = null;
//     }
//   };

//   const connectToServer = () => {
//     if (!serverAddress) {
//       Alert.alert('Error', 'Please enter server address');
//       return;
//     }

//     const socketUrl = serverAddress.includes('http')
//       ? serverAddress
//       : `http://${serverAddress}:3000`;
//     const newSocket = io(socketUrl, {
//       transports: ['websocket'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//       timeout: 10000,
//     });

//     newSocket.on('connect', () => {
//       setConnected(true);
//       setSocket(newSocket);
//       Alert.alert('Success', 'Connected to server');
//     });

//     newSocket.on('connect_error', error => {
//       Alert.alert('Error', `Connection failed: ${error.message}`);
//       setConnected(false);
//     });

//     newSocket.on('disconnect', () => {
//       setConnected(false);
//       clearSimulationInterval();
//       setSimulationStatus('Ready');
//       Alert.alert('Disconnected', 'Lost connection to server');
//     });
//   };

//   const disconnectFromServer = () => {
//     if (socket) {
//       socket.disconnect();
//       setSocket(null);
//       setConnected(false);
//       clearSimulationInterval();
//       setSimulationStatus('Ready');
//     }
//   };

//   const generateMeasurement = () => {
//     // Sử dụng giá trị từ ref để đảm bảo luôn lấy giá trị mới nhất
//     return {
//       systolic: Math.floor(systolicRef.current),
//       diastolic: Math.floor(diastolicRef.current),
//       pulse: Math.floor(pulseRef.current),
//       timestamp: Date.now(),
//     };
//   };

//   const sendMeasurement = () => {
//     if (socket && connected) {
//       const measurement = generateMeasurement();
//       socket.emit('newMeasurement', measurement);
//       console.log('Sent measurement:', measurement);
//     }
//   };

//   const startContinuousSimulation = () => {
//     if (!socket || !connected) {
//       Alert.alert('Error', 'Please connect to server first');
//       return;
//     }

//     setSimulationStatus('Simulating...');
//     clearSimulationInterval();

//     // Gửi dữ liệu ngay lập tức
//     sendMeasurement();

//     // Thiết lập interval mới
//     simulationIntervalRef.current = setInterval(() => {
//       sendMeasurement();
//     });
//   };

//   const stopContinuousSimulation = () => {
//     clearSimulationInterval();
//     setSimulationStatus('Ready');
//   };

//   // Hàm xử lý mới để đồng bộ hóa state UI và ref
//   const updateSystolic = value => {
//     setSystolic(value); // Cập nhật UI
//     systolicRef.current = value; // Cập nhật ref

//     if (isDragging && socket && connected) {
//       sendMeasurement();
//     }
//   };

//   const updateDiastolic = value => {
//     setDiastolic(value);
//     diastolicRef.current = value;

//     if (isDragging && socket && connected) {
//       sendMeasurement();
//     }
//   };

//   const updatePulse = value => {
//     setPulse(value);
//     pulseRef.current = value;

//     if (isDragging && socket && connected) {
//       sendMeasurement();
//     }
//   };

//   const handleSliderValueStart = () => {
//     setIsDragging(true);
//   };

//   const handleSliderValueEnd = () => {
//     setIsDragging(false);

//     // Gửi lần cuối khi thả
//     if (socket && connected) {
//       sendMeasurement();
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.header}>Blood Pressure Simulator</Text>

//       <View style={styles.controlPanel}>
//         <Text style={styles.label}>Server Address:</Text>
//         <TextInput
//           style={styles.input}
//           value={serverAddress}
//           onChangeText={setServerAddress}
//           placeholder="e.g., 192.168.1.100"
//         />
//         {!connected ? (
//           <TouchableOpacity style={styles.button} onPress={connectToServer}>
//             <Text style={styles.buttonText}>Connect</Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity
//             style={[styles.button, {backgroundColor: '#D32F2F'}]}
//             onPress={disconnectFromServer}>
//             <Text style={styles.buttonText}>Disconnect</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <View style={styles.settingsPanel}>
//         <Text style={styles.label}>
//           Systolic (mmHg): {Math.floor(systolic)}
//         </Text>
//         <Slider
//           style={styles.slider}
//           minimumValue={80}
//           maximumValue={200}
//           step={1}
//           value={systolic}
//           onValueChange={updateSystolic}
//           onSlidingStart={handleSliderValueStart}
//           onSlidingComplete={handleSliderValueEnd}
//           minimumTrackTintColor="#0066CC"
//           maximumTrackTintColor="#ccc"
//           thumbTintColor="#0066CC"
//         />

//         <Text style={styles.label}>
//           Diastolic (mmHg): {Math.floor(diastolic)}
//         </Text>
//         <Slider
//           style={styles.slider}
//           minimumValue={50}
//           maximumValue={120}
//           step={1}
//           value={diastolic}
//           onValueChange={updateDiastolic}
//           onSlidingStart={handleSliderValueStart}
//           onSlidingComplete={handleSliderValueEnd}
//           minimumTrackTintColor="#0066CC"
//           maximumTrackTintColor="#ccc"
//           thumbTintColor="#0066CC"
//         />

//         <Text style={styles.label}>Pulse (BPM): {Math.floor(pulse)}</Text>
//         <Slider
//           style={styles.slider}
//           minimumValue={40}
//           maximumValue={120}
//           step={1}
//           value={pulse}
//           onValueChange={updatePulse}
//           onSlidingStart={handleSliderValueStart}
//           onSlidingComplete={handleSliderValueEnd}
//           minimumTrackTintColor="#0066CC"
//           maximumTrackTintColor="#ccc"
//           thumbTintColor="#0066CC"
//         />
//       </View>

//       <View style={styles.simulationPanel}>
//         <Text style={styles.statusText}>
//           Status: {simulationStatus}
//           {isDragging ? ' (Real-time update)' : ''}
//         </Text>
//         <Text style={styles.valueText}>
//           Current values: {Math.floor(systolicRef.current)}/
//           {Math.floor(diastolicRef.current)} mmHg,{' '}
//           {Math.floor(pulseRef.current)} BPM
//         </Text>
//         {simulationStatus === 'Ready' ? (
//           <TouchableOpacity
//             style={styles.button}
//             onPress={startContinuousSimulation}>
//             <Text style={styles.buttonText}>Start Continuous Simulation</Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity
//             style={[styles.button, {backgroundColor: '#D32F2F'}]}
//             onPress={stopContinuousSimulation}>
//             <Text style={styles.buttonText}>Stop Simulation</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 20,
//     color: '#0066CC',
//   },
//   controlPanel: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   settingsPanel: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   simulationPanel: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//     color: '#333',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 4,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//   },
//   slider: {
//     width: '100%',
//     height: 40,
//     marginBottom: 16,
//   },
//   button: {
//     backgroundColor: '#0066CC',
//     padding: 14,
//     borderRadius: 4,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   statusText: {
//     fontSize: 16,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   valueText: {
//     fontSize: 16,
//     marginBottom: 16,
//     textAlign: 'center',
//     fontWeight: 'bold',
//     color: '#0066CC',
//   },
// });

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import io from 'socket.io-client';
import Slider from '@react-native-community/slider';
import {Platform} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

export default function App() {
  const [serverAddress, setServerAddress] = useState('');
  const [deviceId, setDeviceId] = useState(() => generateDeviceId()); // Auto-generate device ID on app start
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [simulationStatus, setSimulationStatus] = useState('Ready');
  const [currentPage, setCurrentPage] = useState('main'); // 'main' or 'history'
  const [measurementHistory, setMeasurementHistory] = useState([]);

  // Function to generate a unique device ID
  function generateDeviceId() {
    // Create a unique ID based on timestamp and random values
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000);
    return `BP-${random}`;
  }

  // Sử dụng useRef để theo dõi giá trị hiện tại mà không gây ra re-render
  const systolicRef = useRef(120);
  const diastolicRef = useRef(80);
  const pulseRef = useRef(72);

  // State cho UI
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [pulse, setPulse] = useState(72);

  const [isDragging, setIsDragging] = useState(false);
  const simulationIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
      clearSimulationInterval();
    };
  }, [socket]);

  const clearSimulationInterval = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  };

  const connectToServer = () => {
    if (!serverAddress) {
      Alert.alert('Error', 'Please enter server address');
      return;
    }

    const socketUrl = serverAddress.includes('http')
      ? serverAddress
      : `http://${serverAddress}:3000`;
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      setSocket(newSocket);
      Alert.alert('Success', 'Connected to server');
    });

    newSocket.on('connect_error', error => {
      Alert.alert('Error', `Connection failed: ${error.message}`);
      setConnected(false);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      clearSimulationInterval();
      setSimulationStatus('Ready');
      Alert.alert('Disconnected', 'Lost connection to server');
    });
  };

  const disconnectFromServer = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      clearSimulationInterval();
      setSimulationStatus('Ready');
    }
  };

  const generateMeasurement = () => {
    // Create a measurement object
    const measurement = {
      deviceId: deviceId,
      systolic: Math.floor(systolicRef.current),
      diastolic: Math.floor(diastolicRef.current),
      pulse: Math.floor(pulseRef.current),
      timestamp: Date.now(),
    };

    // Add to history
    setMeasurementHistory(prevHistory => [measurement, ...prevHistory]);

    return measurement;
  };

  const sendMeasurement = () => {
    if (socket && connected) {
      const measurement = generateMeasurement();
      socket.emit('newMeasurement', measurement);
      console.log('Sent measurement:', measurement);
    }
  };

  const startContinuousSimulation = () => {
    if (!socket || !connected) {
      Alert.alert('Error', 'Please connect to server first');
      return;
    }

    setSimulationStatus('Simulating...');
    clearSimulationInterval();

    // Gửi dữ liệu ngay lập tức
    sendMeasurement();

    // Thiết lập interval mới
    simulationIntervalRef.current = setInterval(() => {
      sendMeasurement();
    }, 1000); // Send every second
  };

  const stopContinuousSimulation = () => {
    clearSimulationInterval();
    setSimulationStatus('Ready');
  };

  // Hàm xử lý mới để đồng bộ hóa state UI và ref
  const updateSystolic = value => {
    setSystolic(value); // Cập nhật UI
    systolicRef.current = value; // Cập nhật ref

    if (isDragging && socket && connected) {
      sendMeasurement();
    }
  };

  const updateDiastolic = value => {
    setDiastolic(value);
    diastolicRef.current = value;

    if (isDragging && socket && connected) {
      sendMeasurement();
    }
  };

  const updatePulse = value => {
    setPulse(value);
    pulseRef.current = value;

    if (isDragging && socket && connected) {
      sendMeasurement();
    }
  };

  const handleSliderValueStart = () => {
    setIsDragging(true);
  };

  const handleSliderValueEnd = () => {
    setIsDragging(false);

    // Gửi lần cuối khi thả
    if (socket && connected) {
      sendMeasurement();
    }
  };

  // Function to format date from timestamp
  const formatDate = timestamp => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = getMonthShortName(date.getMonth());
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} - ${hours}:${minutes}`;
  };

  // Get short month name
  const getMonthShortName = monthIndex => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[monthIndex];
  };

  // Function to get time for chart labels
  const getTimeLabel = timestamp => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Function to determine blood pressure stage
  const getBPStage = (systolic, diastolic) => {
    if (systolic >= 180 || diastolic >= 120) {
      return {stage: 'Crisis', color: '#FF0000'};
    } else if (systolic >= 140 || diastolic >= 90) {
      return {stage: 'Stage 2', color: '#FF6B6B'};
    } else if (
      (systolic >= 130 && systolic < 140) ||
      (diastolic >= 80 && diastolic < 90)
    ) {
      return {stage: 'Stage 1', color: '#FFD700'};
    } else if (systolic >= 120 && systolic < 130 && diastolic < 80) {
      return {stage: 'Elevated', color: '#FFAE42'};
    } else {
      return {stage: 'Normal', color: '#4169E1'};
    }
  };

  // Function to determine heart rate status
  const getHeartRateStatus = pulse => {
    if (pulse < 60) {
      return {status: 'Low', color: '#FFD700'};
    } else if (pulse > 100) {
      return {status: 'High', color: '#FF6B6B'};
    } else {
      return {status: 'Normal', color: '#A86CFF'};
    }
  };

  // Function to clear history
  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all measurement history?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setMeasurementHistory([]),
        },
      ],
    );
  };

  // Prepare data for chart
  const prepareChartData = () => {
    // Use at most the last 10 measurements (in reverse, so oldest first)
    const chartItems = [...measurementHistory].reverse().slice(0, 10);

    if (chartItems.length === 0) {
      // Return dummy data if no measurements
      return {
        labels: Array(6).fill('00:00'),
        datasets: [
          {
            data: Array(6).fill(120),
            color: () => 'rgba(255, 0, 0, 0.5)',
            strokeWidth: 2,
          },
          {
            data: Array(6).fill(80),
            color: () => 'rgba(0, 0, 255, 0.5)',
            strokeWidth: 2,
          },
        ],
      };
    }

    return {
      labels: chartItems.map(item => getTimeLabel(item.timestamp)),
      datasets: [
        {
          data: chartItems.map(item => item.systolic),
          color: () => 'rgba(255, 0, 0, 0.8)', // Red for systolic
          strokeWidth: 2,
        },
        {
          data: chartItems.map(item => item.diastolic),
          color: () => 'rgba(0, 0, 255, 0.8)', // Blue for diastolic
          strokeWidth: 2,
        },
      ],
    };
  };

  // Render card for blood pressure reading
  const renderReadingCard = ({item}) => {
    const bpStatus = getBPStage(item.systolic, item.diastolic);
    const hrStatus = getHeartRateStatus(item.pulse);

    return (
      <View style={styles.readingCard}>
        <View style={styles.readingHeader}>
          <Text style={styles.readingDate}>{formatDate(item.timestamp)}</Text>
          <Text style={styles.readingDeviceId}>Device ID: {item.deviceId}</Text>
        </View>

        <View style={styles.readingValues}>
          <View style={styles.readingColumn}>
            <Text style={styles.readingLabel}>Systolic</Text>
            <Text style={[styles.readingValue, {color: '#FF6B6B'}]}>
              {item.systolic}
            </Text>
            <Text style={styles.readingUnit}>mmHg</Text>
            <View
              style={[styles.statusPill, {backgroundColor: bpStatus.color}]}>
              <Text style={styles.statusText}>{bpStatus.stage}</Text>
            </View>
          </View>

          <View style={styles.readingColumn}>
            <Text style={styles.readingLabel}>Diastolic</Text>
            <Text style={[styles.readingValue, {color: '#4169E1'}]}>
              {item.diastolic}
            </Text>
            <Text style={styles.readingUnit}>mmHg</Text>
            <View style={[styles.statusPill, {backgroundColor: '#4169E1'}]}>
              <Text style={styles.statusText}>Normal</Text>
            </View>
          </View>

          <View style={styles.readingColumn}>
            <Text style={styles.readingLabel}>Heart Rate</Text>
            <Text style={[styles.readingValue, {color: '#A86CFF'}]}>
              {item.pulse}
            </Text>
            <Text style={styles.readingUnit}>bpm</Text>
            <View
              style={[styles.statusPill, {backgroundColor: hrStatus.color}]}>
              <Text style={styles.statusText}>{hrStatus.status}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Main simulator screen
  const renderMainScreen = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Blood Pressure Simulator</Text>

      <View style={styles.controlPanel}>
        <Text style={styles.label}>Server Address:</Text>
        <TextInput
          style={styles.input}
          value={serverAddress}
          onChangeText={setServerAddress}
          placeholder="e.g., 192.168.1.100"
        />

        <Text style={styles.label}>Device ID (Auto-generated):</Text>
        <Text style={styles.deviceIdDisplay}>{deviceId}</Text>

        {!connected ? (
          <TouchableOpacity style={styles.button} onPress={connectToServer}>
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#D32F2F'}]}
            onPress={disconnectFromServer}>
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.settingsPanel}>
        <Text style={styles.label}>
          Systolic (mmHg): {Math.floor(systolic)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={80}
          maximumValue={200}
          step={1}
          value={systolic}
          onValueChange={updateSystolic}
          onSlidingStart={handleSliderValueStart}
          onSlidingComplete={handleSliderValueEnd}
          minimumTrackTintColor="#0066CC"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#0066CC"
        />

        <Text style={styles.label}>
          Diastolic (mmHg): {Math.floor(diastolic)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={50}
          maximumValue={120}
          step={1}
          value={diastolic}
          onValueChange={updateDiastolic}
          onSlidingStart={handleSliderValueStart}
          onSlidingComplete={handleSliderValueEnd}
          minimumTrackTintColor="#0066CC"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#0066CC"
        />

        <Text style={styles.label}>Pulse (BPM): {Math.floor(pulse)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={40}
          maximumValue={120}
          step={1}
          value={pulse}
          onValueChange={updatePulse}
          onSlidingStart={handleSliderValueStart}
          onSlidingComplete={handleSliderValueEnd}
          minimumTrackTintColor="#0066CC"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#0066CC"
        />
      </View>

      <View style={styles.simulationPanel}>
        <Text style={styles.statusText}>
          Status: {simulationStatus}
          {isDragging ? ' (Real-time update)' : ''}
        </Text>
        <Text style={styles.valueText}>
          Current values: {Math.floor(systolicRef.current)}/
          {Math.floor(diastolicRef.current)} mmHg,{' '}
          {Math.floor(pulseRef.current)} BPM
        </Text>
        <Text style={styles.deviceText}>
          Device ID: {deviceId || 'Not set'}
        </Text>
        {simulationStatus === 'Ready' ? (
          <TouchableOpacity
            style={styles.button}
            onPress={startContinuousSimulation}>
            <Text style={styles.buttonText}>Start Continuous Simulation</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#D32F2F'}]}
            onPress={stopContinuousSimulation}>
            <Text style={styles.buttonText}>Stop Simulation</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentPage === 'main' && styles.activeNavButton,
          ]}
          onPress={() => setCurrentPage('main')}>
          <Text
            style={[
              styles.navButtonText,
              currentPage === 'main' && styles.activeNavButtonText,
            ]}>
            Main
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentPage === 'history' && styles.activeNavButton,
          ]}
          onPress={() => setCurrentPage('history')}>
          <Text
            style={[
              styles.navButtonText,
              currentPage === 'history' && styles.activeNavButtonText,
            ]}>
            History
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // History screen
  const renderHistoryScreen = () => {
    const chartData = prepareChartData();
    return (
      <SafeAreaView style={styles.historyContainer}>
        <View style={styles.historyHeaderBar}>
          <TouchableOpacity
            onPress={() => setCurrentPage('main')}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.historyTitle}>Measurement History</Text>
        </View>

        <ScrollView style={styles.historyScrollView}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Readings Over Time</Text>

            {measurementHistory.length > 0 ? (
              <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#0A1933',
                  backgroundGradientFrom: '#0A1933',
                  backgroundGradientTo: '#0A1933',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '2',
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '5, 5',
                    strokeWidth: 1,
                  },
                }}
                bezier
                style={styles.chart}
                fromZero
                yAxisSuffix=" mmHg"
                yAxisInterval={1}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={true}
                withHorizontalLines={true}
              />
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyChartText}>No data available</Text>
              </View>
            )}
          </View>

          <Text style={styles.recentReadingsTitle}>Recent Readings</Text>

          {measurementHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>
                No measurements recorded yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={measurementHistory}
              renderItem={renderReadingCard}
              keyExtractor={(item, index) => `measurement-${index}`}
              scrollEnabled={false}
              contentContainerStyle={styles.readingsList}
            />
          )}
        </ScrollView>

        <View style={styles.navBar}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentPage === 'main' && styles.activeNavButton,
            ]}
            onPress={() => setCurrentPage('main')}>
            <Text
              style={[
                styles.navButtonText,
                currentPage === 'main' && styles.activeNavButtonText,
              ]}>
              Main
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentPage === 'history' && styles.activeNavButton,
            ]}
            onPress={() => setCurrentPage('history')}>
            <Text
              style={[
                styles.navButtonText,
                currentPage === 'history' && styles.activeNavButtonText,
              ]}>
              History
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  return currentPage === 'main' ? renderMainScreen() : renderHistoryScreen();
}

const styles = StyleSheet.create({
  deviceIdDisplay: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#555',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#0066CC',
  },
  controlPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  settingsPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  simulationPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0066CC',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  valueText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#0066CC',
  },
  deviceText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },

  // Navigation styles
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeNavButton: {
    backgroundColor: '#0066CC',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0066CC',
  },
  activeNavButtonText: {
    color: '#fff',
  },

  // History screen styles - New Dark Theme
  historyContainer: {
    flex: 1,
    backgroundColor: '#0A1933',
  },
  historyScrollView: {
    flex: 1,
  },
  historyHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0066CC',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartContainer: {
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4169E1',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111E3A',
    borderRadius: 16,
  },
  emptyChartText: {
    color: '#6C8BC9',
    fontSize: 16,
  },
  recentReadingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4169E1',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  readingsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  readingCard: {
    backgroundColor: '#111E3A',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#223566',
    paddingBottom: 8,
  },
  readingDate: {
    color: '#6C8BC9',
    fontSize: 14,
  },
  readingDeviceId: {
    color: '#6C8BC9',
    fontSize: 14,
  },
  readingValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  readingColumn: {
    flex: 1,
    alignItems: 'center',
  },
  readingLabel: {
    color: '#6C8BC9',
    fontSize: 14,
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  readingUnit: {
    color: '#6C8BC9',
    fontSize: 14,
    marginBottom: 8,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyHistory: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistoryText: {
    color: '#6C8BC9',
    fontSize: 16,
  },
});
