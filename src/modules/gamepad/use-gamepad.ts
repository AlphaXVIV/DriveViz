/* eslint-disable no-plusplus */
import * as React from 'react';
import { GamepadsMap } from './types';

export function useGamepad(callback?: (gamepads: GamepadsMap) => void) {
  const raf = React.useRef<number>();
  const gamepadsRef = React.useRef<GamepadsMap>({});

  const addGamepad = React.useCallback(
    (gamepad: Gamepad | null) => {
      if (gamepad) {
        gamepadsRef.current = {
          ...gamepadsRef.current,
          [gamepad.index]: gamepad,
        };

        if (callback) {
          callback(gamepadsRef.current);
        }
      }
    },
    [callback],
  );

  React.useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      // eslint-disable-next-line no-console
      console.log(
        'Gamepad connected at index %d: %s. %d buttons, %d axes.',
        e.gamepad.index,
        e.gamepad.id,
        e.gamepad.buttons.length,
        e.gamepad.axes.length,
      );
      addGamepad(e.gamepad);
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      // eslint-disable-next-line no-console
      console.log('Gamepad disconnected from index %d: %s', e.gamepad.index, e.gamepad.id);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [addGamepad]);

  const scanGamepads = React.useCallback(() => {
    const activeGamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    if (activeGamepads) {
      for (let i = 0; i < activeGamepads.length; i++) {
        if (activeGamepads[i]) {
          addGamepad(activeGamepads[i]);
        }
      }
    }

    raf.current = requestAnimationFrame(scanGamepads);
  }, [addGamepad]);

  React.useEffect(() => {
    raf.current = requestAnimationFrame(scanGamepads);

    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, [scanGamepads]);

  return gamepadsRef.current;
}
