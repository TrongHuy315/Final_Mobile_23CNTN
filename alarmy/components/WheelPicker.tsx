import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface WheelPickerProps {
  data: number[];
  initialValue: number;
  onValueChange: (value: number) => void;
  itemHeight?: number;
  visibleItems?: number;
  containerStyle?: any;
}

const WheelPicker = React.memo(({
  data,
  initialValue,
  onValueChange,
  itemHeight = 60,
  visibleItems = 3,
  containerStyle,
}: WheelPickerProps) => {
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const scrollViewRef = useRef<ScrollView>(null);
  const isInitialScroll = useRef(true);

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / itemHeight);
    if (index >= 0 && index < data.length) {
      const val = data[index];
      setSelectedValue(val);
      onValueChange(val);
    }
  };

  const onScrollEndDrag = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / itemHeight);
    if (index >= 0 && index < data.length) {
      const val = data[index];
      setSelectedValue(val);
      onValueChange(val);
    }
  };

  useEffect(() => {
    // Selection padding is roughly (visibleItems - 1) / 2
    const scrollToIndex = data.indexOf(initialValue);
    if (scrollToIndex !== -1) {
       // Using small timeout to ensure layout is ready
       setTimeout(() => {
         scrollViewRef.current?.scrollTo({
           y: scrollToIndex * itemHeight,
           animated: false,
         });
       }, 50);
    }
  }, [initialValue, data, itemHeight]);

  return (
    <View style={[styles.container, { height: itemHeight * visibleItems }, containerStyle]}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / itemHeight);
          if (index >= 0 && index < data.length) {
            const val = data[index];
            if (val !== selectedValue) setSelectedValue(val);
          }
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: itemHeight * ((visibleItems - 1) / 2),
        }}
      >
        {data.map((item) => {
          const isSelected = item === selectedValue;
          return (
            <View key={`picker-${item}`} style={[styles.item, { height: itemHeight }]}>
              <Text style={[
                styles.text,
                isSelected && styles.textSelected,
                !isSelected && styles.textFaded,
              ]}>
                {String(item).padStart(2, '0')}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={[styles.lineTop, { top: itemHeight * ((visibleItems - 1) / 2) }]} pointerEvents="none" />
      <View style={[styles.lineBottom, { top: itemHeight * ((visibleItems + 1) / 2) }]} pointerEvents="none" />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 80,
    overflow: 'hidden',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
  },
  textSelected: {
    color: '#ffffff',
  },
  textFaded: {
    color: '#475569',
    opacity: 0.5,
  },
  lineTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lineBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default WheelPicker;
