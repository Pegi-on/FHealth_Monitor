// utils.js
import { NetworkInfo } from 'react-native-network-info';

export const getIpAddress = () => {
  return new Promise((resolve, reject) => {
    NetworkInfo.getIPAddress()
      .then(ipAddress => {
        resolve(ipAddress);
      })
      .catch(error => {
        reject(error);
      });
  });
};