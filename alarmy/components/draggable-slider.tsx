import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

export function DraggableSlider() {
  const TRACK_WIDTH = 220;
  const KNOB_SIZE = 24;
  const MAX_X = TRACK_WIDTH - KNOB_SIZE;

  // mặc định knob ở sát phải
  const pan = useRef(new Animated.Value(MAX_X)).current;
  const currentX = useRef(MAX_X);

  const [value, setValue] = useState(100);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        // lưu vị trí hiện tại khi bắt đầu kéo
        pan.stopAnimation((v) => {
          currentX.current = v;
        });
      },

      onPanResponderMove: (_, gesture) => {
        let x = currentX.current + gesture.dx;

        if (x < 0) x = 0;
        if (x > MAX_X) x = MAX_X;

        pan.setValue(x);

        const percent = Math.round((x / MAX_X) * 100);
        setValue(percent);
      },

      onPanResponderRelease: () => {
        // cập nhật lại vị trí cuối
        pan.stopAnimation((v) => {
          currentX.current = v;
        });
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.knob,
            {
              transform: [{ translateX: pan }],
            },
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
  track: {
    width: 220,
    height: 6,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#38bdf8',
    top: -9,
  },
});
