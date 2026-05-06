import React from 'react';
import { Slide, ToastContainer, type ToastContainerProps } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type AppToastContainerProps = Partial<ToastContainerProps>;

const AppToastContainer: React.FC<AppToastContainerProps> = (props) => (
  <ToastContainer
    position="bottom-right"
    autoClose={3500}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    theme="colored"
    transition={Slide}
    toastStyle={{ borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
    bodyStyle={{ padding: '10px 12px', color: '#ffffff', margin: 0 }}
    progressStyle={{ height: '4px', background: 'rgba(255, 255, 255, 0.72)' }}
    {...props}
  />
);

export default AppToastContainer;