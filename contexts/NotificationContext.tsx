/** @jsxRuntime classic */
import * as React from 'react';
import Modal from '../components/common/Modal.tsx';

type NotificationType = 'success' | 'error';

interface NotificationState {
  isOpen: boolean;
  message: string;
  type: NotificationType;
  title: string;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType, title?: string) => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = React.useState<NotificationState>({
    isOpen: false,
    message: '',
    type: 'success',
    title: ''
  });

  const showNotification = React.useCallback((message: string, type: NotificationType, title?: string) => {
    setNotification({
      isOpen: true,
      message,
      type,
      title: title || (type === 'success' ? 'Éxito' : 'Error')
    });
  }, []);

  const hideNotification = () => {
    setNotification({ ...notification, isOpen: false });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Modal
        isOpen={notification.isOpen}
        onClose={hideNotification}
        title={notification.title}
        type={notification.type}
      >
        {notification.message}
      </Modal>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};