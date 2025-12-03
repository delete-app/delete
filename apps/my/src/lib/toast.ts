import toast from 'react-hot-toast'

export const notify = {
  success: (message: string) =>
    toast.success(message, {
      style: {
        background: '#1a1a1a',
        color: '#fafafa',
        border: '1px solid #333',
      },
      iconTheme: {
        primary: '#22c55e',
        secondary: '#1a1a1a',
      },
    }),

  error: (message: string) =>
    toast.error(message, {
      style: {
        background: '#1a1a1a',
        color: '#fafafa',
        border: '1px solid #333',
      },
      iconTheme: {
        primary: '#ff6b6b',
        secondary: '#1a1a1a',
      },
    }),

  loading: (message: string) =>
    toast.loading(message, {
      style: {
        background: '#1a1a1a',
        color: '#fafafa',
        border: '1px solid #333',
      },
    }),

  dismiss: toast.dismiss,
}

export { toast }
