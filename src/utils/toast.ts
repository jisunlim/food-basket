import Toast from 'react-native-root-toast';

export const showToast = (message: string, duration: number = 2000) => {
  Toast.show(message, {
    duration,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
  });
};

