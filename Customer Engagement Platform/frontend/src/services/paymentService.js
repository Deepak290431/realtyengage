import { axiosInstance } from './authService';

const paymentService = {
  // Initiate payment
  initiatePayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments/initiate', paymentData);
    return response.data;
  },

  // Verify payment after Razorpay callback
  verifyPayment: async (verificationData) => {
    const response = await axiosInstance.post('/payments/verify', verificationData);
    return response.data;
  },

  // Get payments
  getPayments: async (params = {}) => {
    const response = await axiosInstance.get('/payments', { params });
    return response.data;
  },

  // Get single payment
  getPayment: async (id) => {
    const response = await axiosInstance.get(`/payments/${id}`);
    return response.data;
  },

  // Initiate refund (Admin only)
  initiateRefund: async (id, refundData) => {
    const response = await axiosInstance.post(`/payments/${id}/refund`, refundData);
    return response.data;
  },

  // Get payment statistics (Admin only)
  getPaymentStats: async () => {
    const response = await axiosInstance.get('/payments/stats/overview');
    return response.data;
  },

  // Get my payments (Customer)
  getMyPayments: async (params = {}) => {
    const response = await axiosInstance.get('/payments', {
      params: {
        ...params,
        sort: '-createdAt'
      }
    });
    return response.data;
  },

  // Load Razorpay script
  loadRazorpayScript: () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  // Open Razorpay checkout
  openRazorpayCheckout: async (options, paymentData) => {
    const res = await paymentService.loadRazorpayScript();

    if (!res) {
      throw new Error('Razorpay SDK failed to load');
    }

    return new Promise((resolve, reject) => {
      const razorpayOptions = {
        key: options.razorpayKey,
        amount: paymentData.amount * 100, // Amount in paise
        currency: 'INR',
        name: 'RealtyEngage',
        description: `Payment for ${paymentData.projectName || 'Project'}`,
        order_id: options.razorpayOrderId,
        handler: function (response) {
          resolve(response);
        },
        prefill: {
          name: options.customerName,
          email: options.customerEmail,
          contact: options.customerPhone
        },
        theme: {
          color: '#1976d2'
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();
    });
  },

  // Calculate EMI
  calculateEMI: (principal, rate, tenure) => {
    const monthlyRate = rate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  },

  // Get payment methods
  getPaymentMethods: () => {
    return [
      { value: 'card', label: 'Credit/Debit Card', icon: 'credit_card' },
      { value: 'bank_transfer', label: 'Bank Transfer', icon: 'account_balance' },
      { value: 'upi', label: 'UPI', icon: 'phone_android' },
      { value: 'cash', label: 'Cash', icon: 'payments' },
      { value: 'cheque', label: 'Cheque', icon: 'receipt' }
    ];
  },

  // Get payment types
  getPaymentTypes: () => {
    return [
      { value: 'booking', label: 'Booking Amount' },
      { value: 'down_payment', label: 'Down Payment' },
      { value: 'emi', label: 'EMI' },
      { value: 'full_payment', label: 'Full Payment' },
      { value: 'other', label: 'Other' }
    ];
  },

  // Get payment statuses
  getPaymentStatuses: () => {
    return [
      { value: 'pending', label: 'Pending', color: 'warning' },
      { value: 'processing', label: 'Processing', color: 'info' },
      { value: 'success', label: 'Success', color: 'success' },
      { value: 'failed', label: 'Failed', color: 'error' },
      { value: 'refunded', label: 'Refunded', color: 'default' }
    ];
  },

  // Get transaction history
  getTransactionHistory: async () => {
    const response = await axiosInstance.get('/payments/transactions/history');
    return response.data;
  }
};

export default paymentService;
