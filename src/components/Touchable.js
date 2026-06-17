import React from 'react';
import { Pressable } from 'react-native';

// TouchableOpacity 대체용. 웹에서는 마우스 hover 시 hoverStyle(없으면 살짝 밝아짐)을,
// 누를 때는 opacity 피드백을 준다. 모바일에서는 hover가 없어 press 피드백만 동작.
export default function Touchable({
  style,
  hoverStyle,
  pressedOpacity = 0.85,
  children,
  ...props
}) {
  return (
    <Pressable
      style={({ hovered, pressed }) => [
        style,
        hovered && (hoverStyle || { opacity: 0.92 }),
        pressed && { opacity: pressedOpacity },
        { cursor: 'pointer' },
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}
