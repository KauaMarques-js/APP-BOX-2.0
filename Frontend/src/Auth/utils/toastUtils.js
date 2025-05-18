import { toast } from "react-toastify";

export const showToast = (type, message, extra = {}) =>
  toast[type](message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    closeButton: true,
    ...extra,
  });
