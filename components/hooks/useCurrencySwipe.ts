import { useRef } from 'react';
import { PanResponder, PanResponderInstance } from 'react-native';
import { currencies } from '@/constants/currencies';

const SWIPE_THRESHOLD = 50;

function getCurrencyIndex(code: string) {
  return currencies.findIndex(c => c.code === code);
}

function cycleCurrency(current: string, direction: 'next' | 'prev') {
  const currentIndex = getCurrencyIndex(current);
  if (currentIndex === -1) return currencies[0].code;

  const newIndex = direction === 'next'
    ? (currentIndex + 1) % currencies.length
    : (currentIndex - 1 + currencies.length) % currencies.length;

  return currencies[newIndex].code;
}

export function useCurrencySwipe(
  currency: string,
  setCurrency: (code: string) => void
): PanResponderInstance {
  const currencyRef = useRef(currency);
  currencyRef.current = currency;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          setCurrency(cycleCurrency(currencyRef.current, 'prev'));
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          setCurrency(cycleCurrency(currencyRef.current, 'next'));
        }
      },
    })
  ).current;

  return panResponder;
}
