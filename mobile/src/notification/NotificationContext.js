import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationBanner from '../components/NotificationBanner';

const NotificationContext = createContext({
    showNotification: () => { },
});

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'success',
    });

    const showNotification = useCallback(({ title, message, type = 'success' }) => {
        setNotification({
            visible: true,
            title,
            message,
            type,
        });
    }, []);

    const handleDismiss = useCallback(() => {
        setNotification((prev) => ({ ...prev, visible: false }));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <NotificationBanner
                visible={notification.visible}
                title={notification.title}
                message={notification.message}
                type={notification.type}
                onDismiss={handleDismiss}
            />
        </NotificationContext.Provider>
    );
}

export const useNotification = () => useContext(NotificationContext);