import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
  type ComponentType,
} from "react";

interface ModalConfig {
  component: ComponentType<any>;
  props?: Record<string, any>;
}

interface ModalProps {
  content: ReactNode | null;
  setContent?: (content: ReactNode | null) => void;
  openModal?: <T extends Record<string, any>>(
    component: ComponentType<T>,
    props?: T
  ) => void;
  closeModal?: () => void;
}

export const ModalContext = createContext<ModalProps>({
  content: null,
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const openModal = useCallback(
    <T extends Record<string, any>>(component: ComponentType<T>, props?: T) => {
      setModalConfig({ component, props });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalConfig(null);
  }, []);

  const setContent = useCallback((content: ReactNode | null) => {
    // Para compatibilidad con el código existente
    if (content === null) {
      setModalConfig(null);
    } else {
      // Si se pasa JSX directamente, lo envolvemos en un componente
      setModalConfig({
        component: () => content as ReactNode,
        props: {},
      });
    }
  }, []);

  const content = useMemo(() => {
    if (!modalConfig) return null;
    const { component: Component, props = {} } = modalConfig;
    return <Component {...props} />;
  }, [modalConfig]);

  return (
    <ModalContext.Provider
      value={{ content, setContent, openModal, closeModal }}
    >
      {children}
    </ModalContext.Provider>
  );
};
