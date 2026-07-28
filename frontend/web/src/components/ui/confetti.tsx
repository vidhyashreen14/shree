<<<<<<< HEAD
=======
import type { ReactNode } from 'react';
>>>>>>> a821a0c (second update)
import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
<<<<<<< HEAD
  type ReactNode,
} from "react";
import confetti, {
  type GlobalOptions as ConfettiGlobalOptions,
  type CreateTypes as ConfettiInstance,
  type Options as ConfettiOptions,
} from "canvas-confetti";

import { Button } from "@/components/ui/button";
=======
} from 'react';
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from 'canvas-confetti';
import confetti from 'canvas-confetti';

import { Button } from '@/components/ui/button';
>>>>>>> a821a0c (second update)

type Api = {
  fire: (options?: ConfettiOptions) => void;
};

<<<<<<< HEAD
type Props = React.ComponentPropsWithRef<"canvas"> & {
=======
type Props = React.ComponentPropsWithRef<'canvas'> & {
>>>>>>> a821a0c (second update)
  options?: ConfettiOptions;
  globalOptions?: ConfettiGlobalOptions;
  manualstart?: boolean;
  children?: ReactNode;
};

export type ConfettiRef = Api | null;

const ConfettiContext = createContext<Api>({} as Api);

// Define component first
const ConfettiComponent = forwardRef<ConfettiRef, Props>((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    children,
    ...rest
  } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);

  const canvasRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node !== null) {
        if (instanceRef.current) return;
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        });
      } else {
        if (instanceRef.current) {
          instanceRef.current.reset();
          instanceRef.current = null;
        }
      }
    },
<<<<<<< HEAD
    [globalOptions]
=======
    [globalOptions],
>>>>>>> a821a0c (second update)
  );

  const fire = useCallback(
    async (opts = {}) => {
      try {
        await instanceRef.current?.({ ...options, ...opts });
      } catch (error) {
<<<<<<< HEAD
        console.error("Confetti error:", error);
      }
    },
    [options]
=======
        console.error('Confetti error:', error);
      }
    },
    [options],
>>>>>>> a821a0c (second update)
  );

  const api = useMemo(
    () => ({
      fire,
    }),
<<<<<<< HEAD
    [fire]
=======
    [fire],
>>>>>>> a821a0c (second update)
  );

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (!manualstart) {
      (async () => {
        try {
          await fire();
        } catch (error) {
<<<<<<< HEAD
          console.error("Confetti effect error:", error);
=======
          console.error('Confetti effect error:', error);
>>>>>>> a821a0c (second update)
        }
      })();
    }
  }, [manualstart, fire]);

  return (
    <ConfettiContext.Provider value={api}>
      <canvas ref={canvasRef} {...rest} />
      {children}
    </ConfettiContext.Provider>
  );
});

// Set display name immediately
<<<<<<< HEAD
ConfettiComponent.displayName = "Confetti";
=======
ConfettiComponent.displayName = 'Confetti';
>>>>>>> a821a0c (second update)

// Export as Confetti
export const Confetti = ConfettiComponent;

<<<<<<< HEAD
interface ConfettiButtonProps extends React.ComponentProps<"button"> {
=======
interface ConfettiButtonProps extends React.ComponentProps<'button'> {
>>>>>>> a821a0c (second update)
  options?: ConfettiOptions & ConfettiGlobalOptions & { canvas?: HTMLCanvasElement };
}

const ConfettiButtonComponent = ({ options, children, ...props }: ConfettiButtonProps) => {
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      await confetti({
        ...options,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
      });
    } catch (error) {
<<<<<<< HEAD
      console.error("Confetti button error:", error);
=======
      console.error('Confetti button error:', error);
>>>>>>> a821a0c (second update)
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};

<<<<<<< HEAD
ConfettiButtonComponent.displayName = "ConfettiButton";
=======
ConfettiButtonComponent.displayName = 'ConfettiButton';
>>>>>>> a821a0c (second update)

export const ConfettiButton = ConfettiButtonComponent;
