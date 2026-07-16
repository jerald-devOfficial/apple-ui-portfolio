'use client'

import 'react-toastify/dist/ReactToastify.css'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid'
import { ToastContainer, type IconProps } from 'react-toastify'

const AppleToastIcon = ({ type }: IconProps) => {
  const iconClass = 'h-5 w-5 shrink-0'

  switch (type) {
    case 'success':
      return <CheckCircleIcon className={`${iconClass} text-[#34C759]`} aria-hidden />
    case 'error':
      return <XCircleIcon className={`${iconClass} text-[#FF3B30]`} aria-hidden />
    case 'warning':
      return (
        <ExclamationTriangleIcon
          className={`${iconClass} text-[#FF9500]`}
          aria-hidden
        />
      )
    case 'info':
      return (
        <InformationCircleIcon
          className={`${iconClass} text-[#007AFF]`}
          aria-hidden
        />
      )
    default:
      return (
        <InformationCircleIcon
          className={`${iconClass} text-[#8E8E93]`}
          aria-hidden
        />
      )
  }
}

const AppleToastContainer = () => (
  <ToastContainer
    position="bottom-right"
    autoClose={4000}
    hideProgressBar
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    limit={3}
    icon={AppleToastIcon}
    className="apple-toast-container"
    toastClassName="apple-toast"
    closeButton={false}
  />
)

export default AppleToastContainer
