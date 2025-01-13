import { ToastContainer as LibraryToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContainer = (): JSX.Element => {
  return (
    <LibraryToastContainer
      autoClose={5000}
      closeOnClick
      draggable
      hideProgressBar={false}
      newestOnTop={false}
      pauseOnFocusLoss
      pauseOnHover
      position="top-right"
      rtl={false}
      theme="light"
    />
  );
};

export { ToastContainer };
