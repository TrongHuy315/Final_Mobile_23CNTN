import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

interface DraggableSliderProps {
  onValueChange?: (value: number) => void;
}

export function DraggableSlider({ onValueChange } : DraggableSliderProps) {
  const TRACK_WIDTH = 220;
  const KNOB_SIZE = 24;
  const MAX_X = TRACK_WIDTH - KNOB_SIZE;

  const pan = useRef(new Animated.Value(MAX_X)).current;
  const currentX = useRef(MAX_X);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        pan.stopAnimation(v => {
          currentX.current = v;
        });
      },

      onPanResponderMove: (_, gesture) => {
        let x = currentX.current + gesture.dx;
        if (x < 0) x = 0;
        if (x > MAX_X) x = MAX_X;

        pan.setValue(x);

        const percent = Math.round((x / MAX_X) * 100);
        onValueChange?.(percent);
      },

      onPanResponderRelease: () => {
        pan.stopAnimation(v => {
          currentX.current = v;
        });
      },
    })
  ).current;

  const activeTrackWidth = Animated.add(
    pan,
    new Animated.Value(KNOB_SIZE / 2)
  );

  return (
    <View style={styles.container}>
      <View
        style={styles.trackWrapper}
        {...panResponder.panHandlers}
      >
        <View style={styles.trackBg} />

        <Animated.View
          style={[
            styles.activeTrack,
            { width: activeTrackWidth },
          ]}
        />

        <Animated.View
          style={[
            styles.knob,
            { transform: [{ translateX: pan }] },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  trackWrapper: {
    width: 220,
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },

  trackBg: {
    position: 'absolute',
    width: 220,
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
  },

  activeTrack: {
    position: 'absolute',
    left: 0,
    height: 6,
    backgroundColor: '#38bdf8',
    borderRadius: 3,
  },

  knob: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#38bdf8',
    zIndex: 10,
    elevation: 4,
  },
});
