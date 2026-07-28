import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { getRouter } from './router';
import './styles.css';

const router = getRouter();

<<<<<<< HEAD
declare module "@tanstack/react-router" {
=======
declare module '@tanstack/react-router' {
>>>>>>> a821a0c (second update)
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
<<<<<<< HEAD
    </React.StrictMode>
=======
    </React.StrictMode>,
>>>>>>> a821a0c (second update)
  );
}
