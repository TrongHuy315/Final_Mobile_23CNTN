import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
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
  
  // Track synchronization to avoid feedback loops
  const reportedValueRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<any>(null);
  const isMountedRef = useRef(false);

  const paddingTopBottom = useMemo(() => itemHeight * ((visibleItems - 1) / 2), [itemHeight, visibleItems]);

  const updateValue = useCallback((val: number) => {
    if (val !== reportedValueRef.current) {
      reportedValueRef.current = val;
      setSelectedValue(val);
      onValueChange(val);
    }
  }, [onValueChange]);

  const handleScrollSettled = useCallback((offsetY: number) => {
    const index = Math.round(offsetY / itemHeight);
    if (index >= 0 && index < data.length) {
      const val = data[index];
      updateValue(val);
      
      const targetY = index * itemHeight;
      const diff = Math.abs(offsetY - targetY);
      
      if (Platform.OS === 'web' || diff > 1) {
        scrollViewRef.current?.scrollTo({
          y: targetY,
          animated: true,
        });
      }
    }
  }, [data, itemHeight, updateValue]);

  // Sync from prop changes (external)
  useEffect(() => {
    // Scroll on mount or when external initialValue truly changes
    const isFirstRender = !isMountedRef.current;
    if (isFirstRender || (initialValue !== reportedValueRef.current && !isScrollingRef.current)) {
      isMountedRef.current = true;
      reportedValueRef.current = initialValue;
      setSelectedValue(initialValue);
      const index = data.indexOf(initialValue);
      if (index !== -1) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: index * itemHeight,
            animated: !isFirstRender, // Instant on mount, animated on external prop change
          });
        }, 30);
      }
    }
  }, [initialValue, data, itemHeight]);

  const onMomentumScrollEnd = (e: any) => {
    isScrollingRef.current = false;
    handleScrollSettled(e.nativeEvent.contentOffset.y);
  };

  const onScrollEndDrag = (e: any) => {
    // If momentum will continue, don't finalize yet (MomentumScrollEnd will do it)
    if (Platform.OS !== 'web' && e.nativeEvent.velocity?.y !== 0) {
      return;
    }
    isScrollingRef.current = false;
    handleScrollSettled(e.nativeEvent.contentOffset.y);
  };

  const onScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    
    // Update visual highlight during scroll
    if (index >= 0 && index < data.length) {
      const val = data[index];
      if (val !== selectedValue) {
        setSelectedValue(val);
      }
    }

    // Web-specific: momentum events might not fire, so we detect "settled" state
    if (Platform.OS === 'web') {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        handleScrollSettled(y);
      }, 100);
    }
  }, [data, itemHeight, selectedValue, handleScrollSettled]);

  return (
    <View style={[styles.container, { height: itemHeight * visibleItems }, containerStyle]}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        snapToInterval={itemHeight}
        decelerationRate={0.9}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        onScrollBeginDrag={() => { isScrollingRef.current = true; }}
        onMomentumScrollBegin={() => { isScrollingRef.current = true; }}
        contentContainerStyle={{
          paddingVertical: paddingTopBottom,
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
      <View style={[styles.lineTop, { top: paddingTopBottom }]} pointerEvents="none" />
      <View style={[styles.lineBottom, { top: paddingTopBottom + itemHeight }]} pointerEvents="none" />
    </View>
  );
});

WheelPicker.displayName = 'WheelPicker';

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
