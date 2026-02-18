import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Calculator,
  IndianRupee,
  Calendar,
  Home,
  FileText,
  Download,
  Check,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Percent,
  Shield,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Info,
  Building2,
  Banknote,
  User,
  X,
  QrCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import enquiryService from '../services/enquiryService';
import { setEnquiries } from '../store/slices/enquirySlice';
import projectService from '../services/projectService';
import paymentService from '../services/paymentService';

const PaymentsPage = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { enquiries } = useSelector((state) => state.enquiries);

  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEnquiryForPayment, setSelectedEnquiryForPayment] = useState(null);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [paymentPlan, setPaymentPlan] = useState('full'); // 'full' or 'emi'
  const [stats, setStats] = useState({ totalPaid: 0, pending: 0, nextDue: null });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsType, setDetailsType] = useState(''); // 'totalPaid', 'pending', 'nextPayment', 'userDetails'
  const [detailsData, setDetailsData] = useState([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);

  // Payment form states
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentStep, setPaymentStep] = useState('plans'); // 'plans', 'details', 'processing', 'success'
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [utrNumber, setUtrNumber] = useState('');

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch user enquiries to see which ones are 'OK'
      const enquiryResp = await (isAdmin ? enquiryService.getEnquiries() : enquiryService.getMyEnquiries());
      const enquiryData = enquiryResp.data?.data || enquiryResp.data || enquiryResp || [];
      dispatch(setEnquiries(enquiryData));

      // Fetch actual payments
      const paymentsResp = await (isAdmin ? paymentService.getPayments() : paymentService.getMyPayments());
      setPayments(paymentsResp.data?.data || paymentsResp.data || paymentsResp || []);

      // Fetch transaction history
      const transactionsResp = await paymentService.getTransactionHistory();
      const txHistory = transactionsResp.data || [];
      setTransactions(txHistory);

      // Calculate stats
      const totalPaid = txHistory.reduce((acc, tx) => acc + tx.amountPaid, 0);

      let totalPending = 0;
      let closestDue = null;

      enquiryData.filter(e => e.isOk).forEach(e => {
        e.installments?.forEach(inst => {
          if (inst.status === 'pending') {
            totalPending += inst.amount;
            if (!closestDue || new Date(inst.dueDate) < new Date(closestDue.date)) {
              closestDue = { date: inst.dueDate, amount: inst.amount };
            }
          }
        });
      });

      setStats({
        totalPaid,
        pending: totalPending,
        nextDue: closestDue
      });
    } catch (error) {
      console.error('Failed to sync data:', error);
      toast.error('Failed to sync data');
    } finally {
      setLoading(false);
    }
  };



  const handleOpenPayment = (enquiry, installment = null) => {
    if (!enquiry.isOk) {
      toast.error('This property enquiry is not yet marked "OK" by admin.');
      return;
    }
    setSelectedEnquiryForPayment(enquiry);
    setSelectedInstallment(installment);

    // Set amount based on chosen installment or project total
    if (installment) {
      const penalty = calculatePenalty(enquiry, installment);
      setPaymentAmount(installment.amount + penalty);
      setPaymentPlan(enquiry.paymentPlan === 'emi' ? 'emi' : 'full');
      if (penalty > 0) {
        toast.error(`Late payment penalty applied: ${formatCurrency(penalty)}`, {
          icon: '⚠️',
          duration: 4000
        });
      }
    } else {
      const price = enquiry.projectId?.pricing?.basePrice || 1000000;
      setPaymentAmount(price);
    }
    setShowPaymentModal(true);
  };

  // Handle payment flow
  const handlePaymentAction = async () => {
    if (paymentStep === 'plans') {
      if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      if (paymentMethod === 'cash') {
        toast.success('Cash payment confirmed');
        setPaymentStep('processing');
        handleFinalizePayment();
        return;
      }

      setPaymentStep('details');
      return;
    }

    if (paymentStep === 'details') {
      if (paymentMethod === 'card') {
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
          toast.error('Please fill all card details');
          return;
        }
      }

      if (paymentMethod === 'upi') {
        if (!utrNumber || utrNumber.length !== 12) {
          toast.error('Please enter a valid 12-digit UTR number');
          return;
        }
      }

      setPaymentStep('processing');
      handleFinalizePayment();
    }
  };

  const handleFinalizePayment = async () => {
    try {
      console.log('Initiating payment action...', { paymentMethod, paymentAmount, paymentPlan });
      toast.loading('Initiating secure payment...', { id: 'payment' });

      // 1. Initiate payment in backend
      const initiateData = {
        projectId: selectedEnquiryForPayment.projectId._id,
        amount: parseFloat(paymentAmount),
        paymentType: selectedInstallment ? 'emi' : (paymentPlan === 'emi' ? 'booking' : 'full_payment'),
        method: paymentMethod
      };

      const initiateRes = await paymentService.initiatePayment(initiateData);
      console.log('Initiate Response:', initiateRes);

      // Backend returns structure like: { data: { payment: { gatewayDetails: { orderId: ... } }, razorpayOrderId: ... } }
      const paymentRecord = initiateRes.data?.payment || initiateRes.payment;
      setCurrentPaymentId(paymentRecord?._id);

      // Try to get order ID from multiple possible locations
      let orderId = paymentRecord?.gatewayDetails?.orderId || initiateRes.data?.razorpayOrderId || initiateRes.razorpayOrderId;

      // For offline methods, if orderId is missing, generate a mock one so the flow continues
      if (!orderId && (paymentMethod === 'cash' || paymentMethod === 'bank_transfer')) {
        orderId = `${paymentMethod}_order_${Date.now()}`;
        console.log(`Generating fallback Order ID for ${paymentMethod}:`, orderId);
      }

      if (!orderId) {
        throw new Error('Could not generate a valid Order ID. Please try again.');
      }

      console.log('Payment Processing with Order ID:', orderId);

      if (paymentMethod === 'cash') {
        toast.success('Cash payment recorded!', { id: 'payment' });

        const verificationData = {
          paymentId: `cash_${Date.now()}`,
          orderId: orderId,
          signature: 'cash_verified',
          installmentNumber: selectedInstallment ? selectedInstallment.number : (paymentPlan === 'emi' ? 1 : 0),
          projectId: selectedEnquiryForPayment.projectId._id
        };

        console.log('Verifying Cash Payment:', verificationData);
        await paymentService.verifyPayment(verificationData);

      } else {
        toast.loading('Waiting for payment confirmation...', { id: 'payment' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Prepare verification data
        const verificationData = {
          paymentId: paymentMethod === 'upi' ? utrNumber : `pay_${Math.random().toString(36).substr(2, 9)}`,
          orderId: orderId,
          signature: `sig_${Math.random().toString(36).substr(2, 9)}`,
          installmentNumber: selectedInstallment ? selectedInstallment.number : (paymentPlan === 'emi' ? 1 : 0),
          projectId: selectedEnquiryForPayment.projectId._id
        };

        console.log('Verifying Method:', paymentMethod, verificationData);

        // 3. Call backend verify
        await paymentService.verifyPayment(verificationData);
        toast.success('Payment Verified!', { id: 'payment' });
      }

      toast.loading('Processing property documents...', { id: 'verify' });
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Property Secured Successfully!', { id: 'verify' });
      setPaymentStep('success');

      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentStep('plans');
        setPaymentAmount('');
        setUtrNumber('');
        setSelectedInstallment(null);
        setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
        setCurrentPaymentId(null);
        fetchData();
      }, 3000);
    } catch (error) {
      console.error('Detailed Payment Flow Error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Payment failed.';
      toast.error(errorMsg, { id: 'payment' });
      setPaymentStep('details');
    }
  };

  const handleDownloadInvoice = (txId, projectName = 'Property') => {
    toast.loading('Generating Official Invoice...', { id: 'invoice' });

    // Direct link to backend invoice route
    // Note: We use payment ID if possible, but our transactions now hold the key data
    // For this implementation, we'll route to the payment invoice if it's a payment record
    const token = localStorage.getItem('token');
    const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5005/api'}/payments/${txId}/invoice?token=${token}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `Invoice_${projectName}_${txId.slice(-6)}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      toast.success('Official Invoice Downloaded!', { id: 'invoice' });
    }, 2000);
  };

  const handleOpenDetails = (type) => {
    if (!isAdmin) return;

    setDetailsType(type);
    let data = [];

    if (type === 'totalPaid') {
      // Group transactions by user
      const userMap = new Map();
      transactions.forEach(tx => {
        if (!tx.userId) return;
        const userId = tx.userId._id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            name: `${tx.userId.firstName} ${tx.userId.lastName}`,
            email: tx.userId.email,
            phone: tx.userId.phone || 'N/A',
            amount: 0
          });
        }
        userMap.get(userId).amount += tx.amountPaid;
      });
      data = Array.from(userMap.values());
    } else if (type === 'pending' || type === 'nextPayment') {
      // Find pending installments in enquiries
      const userMap = new Map();
      enquiries.filter(e => e.isOk).forEach(enquiry => {
        if (!enquiry.customerId) return;
        const userId = enquiry.customerId._id;

        enquiry.installments?.forEach(inst => {
          if (inst.status === 'pending') {
            if (!userMap.has(userId)) {
              userMap.set(userId, {
                name: `${enquiry.customerId.firstName} ${enquiry.customerId.lastName}`,
                email: enquiry.customerId.email,
                phone: enquiry.customerId.phone || 'N/A',
                amount: 0,
                nextDate: null,
                nextAmount: 0 // Initialize nextAmount
              });
            }

            const userEntry = userMap.get(userId);

            // For 'pending', we want the grand total
            if (type === 'pending') {
              userEntry.amount += inst.amount;
            }

            // For 'nextPayment', we only track the single earliest due date and its amount
            if (type === 'nextPayment') {
              if (!userEntry.nextDate || new Date(inst.dueDate) < new Date(userEntry.nextDate)) {
                userEntry.nextDate = inst.dueDate;
                userEntry.nextAmount = inst.amount;
              }
            }
          }
        });
      });
      data = Array.from(userMap.values());
    }

    setDetailsData(data);
    setShowDetailsModal(true);
  };

  const handleShowUserProfile = (user) => {
    setSelectedUserDetails(user);
    setDetailsType('userDetails');
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const calculatePenalty = (enquiry, installment) => {
    if (!installment || installment.status === 'paid' || !enquiry.projectId) return 0;
    const project = enquiry.projectId;
    const penaltyConfig = project.pricing?.penaltyConfig || { latePenaltyType: 'fixed', latePenaltyValue: 0, gracePeriodDays: 0 };

    if (!installment.dueDate) return 0;

    const dueDate = new Date(installment.dueDate);
    const graceDate = new Date(dueDate);
    graceDate.setDate(graceDate.getDate() + (penaltyConfig.gracePeriodDays || 0));

    if (new Date() > graceDate) {
      if (penaltyConfig.latePenaltyType === 'fixed') {
        return penaltyConfig.latePenaltyValue || 0;
      } else if (penaltyConfig.latePenaltyType === 'percentage') {
        return (installment.amount * (penaltyConfig.latePenaltyValue || 0)) / 100;
      }
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      {isAdmin ? (
        <div className="w-full px-4 md:px-6 py-8">
          <div className="mb-0">
            <h1 className="text-3xl font-bold text-primary">
              Payment Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track and manage all customer payments
            </p>
          </div>
        </div>
      ) : (
        <div className="hero-gradient text-white py-12">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                My Payments
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/90"
              >
                Make secure payments and track your transaction history
              </motion.p>
            </div>
          </div>
        </div>
      )}


      <div className={`${isAdmin ? 'w-full px-4 md:px-6' : 'max-w-[1440px] mx-auto px-6 md:px-10 lg:px-12'} py-8 space-y-12`}>
        {/* Payments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card
              className={`p-6 ${isAdmin ? 'cursor-pointer hover:shadow-md transition-all hover:border-green-300' : ''}`}
              onClick={() => handleOpenDetails('totalPaid')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalPaid)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>
            <Card
              className={`p-6 ${isAdmin ? 'cursor-pointer hover:shadow-md transition-all hover:border-yellow-300' : ''}`}
              onClick={() => handleOpenDetails('pending')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.pending)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>
            <Card
              className={`p-6 ${isAdmin ? 'cursor-pointer hover:shadow-md transition-all hover:border-blue-300' : ''}`}
              onClick={() => handleOpenDetails('nextPayment')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Next Payment</p>
                  <p className="text-lg font-bold">{stats.nextDue ? formatCurrency(stats.nextDue.amount) : formatCurrency(0)}</p>
                  <p className="text-sm font-bold text-gray-700">Due: {stats.nextDue ? formatDate(stats.nextDue.date) : '-'}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Actions */}
          {!isAdmin && (
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Properties Ready for Payment
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enquiries.filter(e => e.isOk).length === 0 ? (
                  <Card className="p-8 border-dashed border-2 flex flex-col items-center justify-center text-center col-span-full">
                    <div className="bg-gray-100 rounded-full p-4 mb-3">
                      <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900">No properties ready yet</h3>
                    <p className="text-sm text-gray-500 max-w-xs">Once the admin gives an "OK" to your enquiry, you can start payments here.</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/projects')}>
                      Browse More Properties
                    </Button>
                  </Card>
                ) : (
                  enquiries.filter(e => e.isOk).map(enquiry => (
                    <Card key={enquiry._id} className="overflow-hidden border-2 border-green-100 hover:border-green-500 transition-all">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{enquiry.projectId?.name}</h3>
                            <p className="text-sm text-gray-500">{enquiry.projectId?.area}</p>
                            <p className="text-[10px] text-primary font-bold mt-1">TOTAL: {formatCurrency(enquiry.projectId?.pricing?.basePrice || 0)}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">OK TAG</Badge>
                        </div>

                        {enquiry.paymentPlan && (
                          <div className="mb-4">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">EMI Installment Tracker</label>
                            <div className="relative group">
                              <select
                                className="w-full p-2.5 text-sm border-2 rounded-xl bg-white focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                value={selectedInstallment?.number || ""}
                                onChange={(e) => {
                                  const inst = enquiry.installments.find(i => i.number === parseInt(e.target.value));
                                  if (inst) {
                                    if (inst.status === 'paid') {
                                      toast.error('This installment is already paid');
                                      return;
                                    }
                                    // Enforce order
                                    const firstPending = enquiry.installments.find(i => i.status === 'pending');
                                    if (inst.number !== firstPending.number) {
                                      toast.error(`Please pay Installment #${firstPending.number} first`);
                                      return;
                                    }
                                    setSelectedEnquiryForPayment(enquiry);
                                    setSelectedInstallment(inst);
                                    setPaymentAmount(inst.amount);
                                    handleOpenPayment(enquiry, inst);
                                  }
                                }}
                              >
                                <option value="">Select Installment ({enquiry.paymentPlan.toUpperCase()})</option>
                                {enquiry.installments.map(inst => {
                                  const firstPending = enquiry.installments.find(i => i.status === 'pending');
                                  const isNext = firstPending && inst.number === firstPending.number;
                                  const isPaid = inst.status === 'paid';
                                  const penalty = calculatePenalty(enquiry, inst);
                                  const isLate = penalty > 0;

                                  return (
                                    <option
                                      key={inst.number}
                                      value={inst.number}
                                      disabled={isPaid || !isNext}
                                      className={isLate ? 'text-red-600 font-bold' : ''}
                                    >
                                      Installment #{inst.number} - {formatCurrency(inst.amount + penalty)} {isPaid ? '✓ (PAID)' : isLate ? '(OVERDUE + PENALTY)' : isNext ? '(DUE NOW)' : '(LOCKED)'}
                                    </option>
                                  );
                                })}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Plan</span>
                            <span className="font-semibold text-primary">{enquiry.paymentPlan ? enquiry.paymentPlan.toUpperCase() : 'Not Set'}</span>
                          </div>
                          <div className="flex justify-between items-start text-sm">
                            <div className="flex flex-col">
                              <span className="text-gray-500">Next Due</span>
                              {(() => {
                                const pending = enquiry.installments?.find(i => i.status === 'pending');
                                if (!pending) return null;
                                const penalty = calculatePenalty(enquiry, pending);
                                return (
                                  <>
                                    <span className={`text-sm font-bold ${penalty > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                      Due: {formatDate(pending.dueDate)}
                                    </span>
                                    {penalty > 0 && (
                                      <span className="text-[10px] font-black text-red-600 animate-pulse flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> LATE PENALTY: {formatCurrency(penalty)}
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                            <span className={`font-bold ${calculatePenalty(enquiry, enquiry.installments?.find(i => i.status === 'pending')) > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              {(() => {
                                const pending = enquiry.installments?.find(i => i.status === 'pending');
                                if (!pending) return 'Paid All';
                                const penalty = calculatePenalty(enquiry, pending);
                                return formatCurrency(pending.amount + penalty);
                              })()}
                            </span>
                          </div>
                        </div>

                        {(!enquiry.paymentPlan || enquiry.installments?.find(i => i.status === 'pending')) && (
                          <Button
                            className="w-full bg-blue-800 hover:bg-blue-900 font-bold h-12 rounded-xl shadow-lg border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all"
                            onClick={() => {
                              const pending = enquiry.installments?.find(i => i.status === 'pending');
                              handleOpenPayment(enquiry, pending);
                            }}
                          >
                            <CreditCard className="h-5 w-5 mr-2" />
                            {enquiry.paymentPlan
                              ? `Pay ${formatCurrency(enquiry.installments?.find(i => i.status === 'pending')?.amount + calculatePenalty(enquiry, enquiry.installments?.find(i => i.status === 'pending')))} (Installment #${enquiry.installments?.find(i => i.status === 'pending')?.number})`
                              : 'Confirm Booking'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {transactions.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No Transactions Yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Your payment history will appear here once you make your first booking or installment payment.</p>
              </Card>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-700" />
                    Recent Activity
                  </h3>
                  <Badge variant="outline" className="text-[10px]">{transactions.length} total payments</Badge>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {transactions.map((tx, idx) => (
                    <motion.div
                      key={tx._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 hover:bg-gray-50/80 transition-color group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${tx.paymentStatus === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                            {tx.installmentType === 'emi' ? <Clock className="h-5 w-5 md:h-6 md:w-6" /> : <Home className="h-5 w-5 md:h-6 md:w-6" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between w-full gap-2">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate text-sm md:text-base">{tx.propertyName}</h4>
                                {isAdmin && tx.userId && (
                                  <Badge
                                    variant="secondary"
                                    className="hidden sm:flex bg-blue-50 text-blue-700 border-blue-100 items-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors shrink-0 text-[10px]"
                                    onClick={() => handleShowUserProfile({
                                      name: `${tx.userId.firstName} ${tx.userId.lastName}`,
                                      email: tx.userId.email,
                                      phone: tx.userId.phone || 'N/A'
                                    })}
                                  >
                                    <User className="h-3 w-3" />
                                    {tx.userId.firstName}
                                  </Badge>
                                )}
                              </div>
                              <Badge className={`${tx.paymentStatus === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} text-[10px] py-0 px-2 shrink-0`}>
                                {tx.paymentStatus.toUpperCase()}
                              </Badge>
                            </div>

                            {isAdmin && tx.userId && (
                              <div className="sm:hidden mt-0.5">
                                <span
                                  className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer"
                                  onClick={() => handleShowUserProfile({
                                    name: `${tx.userId.firstName} ${tx.userId.lastName}`,
                                    email: tx.userId.email,
                                    phone: tx.userId.phone || 'N/A'
                                  })}
                                >
                                  Client: {tx.userId.firstName} {tx.userId.lastName}
                                </span>
                              </div>
                            )}

                            <div className="text-[10px] md:text-xs text-gray-500 flex items-center justify-between w-full mt-1 md:mt-1.5">
                              <span className="flex items-center shrink-0">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(tx.paymentDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="flex items-center uppercase font-black text-[8px] md:text-[9px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400 shrink-0">
                                  {tx.paymentMethod}
                                </span>
                                <span className="text-blue-700 dark:text-blue-400 font-black truncate max-w-[80px] sm:max-w-none">
                                  {tx.installmentType === 'emi' ? `EMI #${tx.installmentNumber}` : 'Settlement'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 bg-blue-50/50 dark:bg-blue-900/10 p-3 md:p-0 rounded-xl md:bg-transparent md:dark:bg-transparent -mx-1 md:mx-0">
                          <div className="text-left md:text-right">
                            <p className="text-lg md:text-xl font-black text-blue-900 dark:text-blue-300">{formatCurrency(tx.amountPaid)}</p>
                            <p className="text-[9px] text-gray-400 font-mono tracking-tighter">REF: {tx._id.slice(-8).toUpperCase()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 md:h-9 px-2 md:px-3 bg-white border-gray-200 hover:border-blue-800 hover:text-blue-800 transition-all font-bold text-xs"
                              onClick={() => handleDownloadInvoice(tx._id, tx.propertyName)}
                            >
                              <Download className="h-4 w-4 md:mr-2" />
                              <span className="hidden md:inline">Invoice</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {paymentStep === 'plans' && 'Secure Your Investment'}
                    {paymentStep === 'details' && `Pay via ${paymentMethod.toUpperCase()}`}
                    {paymentStep === 'processing' && 'Processing Payment'}
                    {paymentStep === 'success' && 'Payment Successful'}
                  </h2>
                  <div className="flex flex-col mt-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Property: {selectedEnquiryForPayment?.projectId?.name}</span>
                    <span className="text-[10px] text-blue-800 font-bold uppercase tracking-widest">{selectedEnquiryForPayment?.projectId?.area}</span>
                  </div>
                </div>
                {paymentStep === 'details' && (
                  <Button variant="ghost" size="sm" onClick={() => setPaymentStep('plans')}>Back</Button>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-3 border-b">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Payable Amount</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(paymentAmount)}</span>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {paymentStep === 'plans' && (
                    <motion.div
                      key="plans"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Select Payment Plan</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <button
                            onClick={() => {
                              setPaymentPlan('full');
                              setPaymentAmount(selectedEnquiryForPayment?.projectId?.pricing?.basePrice || 1000000);
                            }}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${paymentPlan === 'full'
                              ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-sm">Full Payment</span>
                              {paymentPlan === 'full' && <CheckCircle className="h-4 w-4 text-primary" />}
                            </div>
                            <p className="text-[10px] text-gray-500 leading-tight">Pay upfront for maximum discount and priority.</p>
                          </button>

                          <button
                            onClick={() => {
                              setPaymentPlan('emi');
                              const base = selectedEnquiryForPayment?.projectId?.pricing?.basePrice || 1000000;
                              setPaymentAmount(Math.round(base * 0.1));
                            }}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${paymentPlan === 'emi'
                              ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-sm">EMI Plan</span>
                              {paymentPlan === 'emi' && <CheckCircle className="h-4 w-4 text-primary" />}
                            </div>
                            <p className="text-[10px] text-gray-500 leading-tight">10% Booking amount followed by monthly EMIs.</p>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">
                          {paymentPlan === 'full' ? 'Total Amount Payable' : 'Initial Booking Amount'}
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="pl-10 font-bold text-xl h-14 bg-gray-50/50"
                          />
                        </div>
                        {paymentPlan === 'emi' && (
                          <div className="mt-3 flex items-start gap-2 text-blue-600 bg-blue-50 p-2 rounded text-[10px] font-medium leading-relaxed">
                            <Info className="h-4 w-4 shrink-0" />
                            <p>After this payment, your balance will be split into 60 low-interest monthly installments (EMIs).</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">Payment Method</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'card', label: 'Card', icon: CreditCard },
                            { id: 'upi', label: 'UPI', icon: Smartphone },
                            { id: 'bank_transfer', label: 'Bank', icon: Building2 },
                            { id: 'cash', label: 'Cash', icon: Banknote }
                          ].map((method) => (
                            <button
                              key={method.id}
                              onClick={() => {
                                setPaymentMethod(method.id);
                                if (method.id === 'cash') setPaymentStep('plans'); // Reset step if switched to cash
                              }}
                              className={`p-3 rounded-xl border flex flex-col items-center transition-all ${paymentMethod === method.id
                                ? 'border-primary bg-primary text-white shadow-lg'
                                : 'border-gray-200 hover:border-gray-300 bg-gray-50/30'
                                }`}
                            >
                              <method.icon className={`h-4 w-4 mb-2 ${paymentMethod === method.id ? 'text-white' : 'text-gray-400'}`} />
                              <p className="text-[8px] font-bold uppercase tracking-tighter">{method.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentStep === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {paymentMethod === 'upi' ? (
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="bg-[#1C1C1E] p-6 rounded-3xl border border-gray-700 shadow-2xl w-full max-w-[320px] mx-auto text-white">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center p-0.5 shadow-lg">
                                <img src={`https://ui-avatars.com/api/?name=${selectedEnquiryForPayment?.projectId?.builder || 'Owner'}&background=2563eb&color=fff`} alt="User" className="w-full h-full rounded-full border-2 border-[#1C1C1E]" />
                              </div>
                              <div className="text-left">
                                <span className="text-white text-xl font-bold tracking-tight block leading-none truncate max-w-[150px]">
                                  {selectedEnquiryForPayment?.projectId?.builder || 'PROPERTY OWNER'}
                                </span>
                                <span className="text-gray-400 text-[9px] tracking-widest font-bold uppercase mt-1">Official Receiver</span>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.4)] mb-6 mx-auto w-fit min-w-[180px] min-h-[180px] flex items-center justify-center">
                              {selectedEnquiryForPayment?.projectId?.pricing?.upiQRCode?.url ? (
                                <img
                                  src={selectedEnquiryForPayment.projectId.pricing.upiQRCode.url}
                                  alt="UPI QR Code"
                                  className="w-40 h-40 object-contain"
                                />
                              ) : (
                                <div className="w-40 h-40 bg-white flex items-center justify-center relative overflow-hidden">
                                  {/* Fallback stylized QR Code */}
                                  <div className="grid grid-cols-12 grid-rows-12 gap-[2px] w-full h-full p-1 opacity-20">
                                    {[...Array(144)].map((_, i) => (
                                      <div key={i} className={`w-full h-full ${Math.random() > 0.45 ? 'bg-black' : 'bg-transparent'}`} />
                                    ))}
                                  </div>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                    <QrCode className="h-10 w-10 mb-2" />
                                    <span className="text-[8px] font-bold uppercase">QR Coming Soon</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <p className="text-gray-400 text-[10px] font-semibold mb-6 tracking-wide">Scan to pay with any UPI app</p>

                            <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 mb-6 border border-white/5">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                <img src="https://lh3.googleusercontent.com/pw/AMWTs8C-F5Xm-p9D-0v6x8U2vD6Y" alt="Union Bank" className="w-5 h-5 object-contain" onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=U&background=005a9c&color=fff' }} />
                              </div>
                              <div className="text-left overflow-hidden">
                                <p className="text-white text-xs font-semibold truncate">Union Bank of India 0429</p>
                              </div>
                            </div>

                            <div className="pt-0">
                              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500">
                                <span className="text-blue-400">dsakthi533@okhdfcbank</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText('dsakthi533@okhdfcbank');
                                    toast.success('UPI ID Copied!');
                                  }}
                                  className="p-1 hover:text-white transition-colors"
                                >
                                  <FileText className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl text-[10px] space-y-2 border border-yellow-200 shadow-sm w-full">
                            <div className="flex items-center gap-2 font-bold text-yellow-900 mb-0.5">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              VERIFICATION REQUIRED
                            </div>
                            <p className="leading-tight opacity-90">Enter the 12-digit UTR No. from your bank app.</p>
                            <div className="relative">
                              <Input
                                placeholder="Enter 12-digit UTR"
                                className="bg-white border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500/20 font-mono text-center tracking-[0.2em] h-10 text-base font-bold"
                                maxLength={12}
                                value={utrNumber}
                                onChange={(e) => setUtrNumber(e.target.value)}
                              />
                            </div>
                            <Button
                              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-9 text-[10px]"
                              onClick={handleFinalizePayment}
                              disabled={!utrNumber || utrNumber.length !== 12 || paymentStep === 'processing'}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Verify Transaction
                            </Button>
                          </div>
                        </div>
                      ) : paymentMethod === 'card' ? (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                              <CreditCard className="h-20 w-20" />
                            </div>
                            <div className="relative z-10">
                              <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Card Number</p>
                              <p className="text-xl font-mono tracking-widest mb-6">
                                {cardDetails.number || 'XXXX-XXXX-XXXX-XXXX'}
                              </p>
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Card Holder</p>
                                  <p className="font-bold tracking-wide uppercase text-sm">{cardDetails.name || 'YOUR NAME'}</p>
                                </div>
                                <div>
                                  <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Expires</p>
                                  <p className="font-mono text-sm">{cardDetails.expiry || 'MM/YY'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Input
                              placeholder="Card Holder Name"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                            />
                            <Input
                              placeholder="Card Number"
                              maxLength={19}
                              value={cardDetails.number}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 16) val = val.slice(0, 16);
                                const formatted = val.match(/.{1,4}/g)?.join('-') || val;
                                setCardDetails({ ...cardDetails, number: formatted });
                              }}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                placeholder="MM/YY"
                                maxLength={5}
                                value={cardDetails.expiry}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, '');
                                  if (val.length > 4) val = val.slice(0, 4);
                                  if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
                                  setCardDetails({ ...cardDetails, expiry: val });
                                }}
                              />
                              <Input
                                placeholder="CVV"
                                type="password"
                                maxLength={3}
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center space-y-4">
                          <div className="bg-blue-100 h-14 w-14 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <Building2 className="h-7 w-7 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-gray-900">Bank Transfer Details</p>
                            <p className="text-[10px] text-gray-500">Beneficiary: RealtyEngage Solutions</p>
                            <p className="text-[10px] text-gray-500">A/C: 912010034455667</p>
                            <p className="text-[10px] text-gray-500">IFSC: UTIB0000429</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-[9px] text-blue-700 italic">Please complete the transfer and click "Confirm Payment" below. Our team will verify and issue the receipt within 24 hours.</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {paymentStep === 'processing' && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 flex flex-col items-center space-y-6"
                    >
                      <div className="relative">
                        <div className="h-20 w-20 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 h-20 w-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">Verifying with Bank</p>
                        <p className="text-sm text-gray-500">Please do not refresh or close this window...</p>
                      </div>
                    </motion.div>
                  )}

                  {paymentStep === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 flex flex-col items-center space-y-6"
                    >
                      <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Booking Confirmed!</p>
                        <p className="text-sm text-gray-500 mt-2">Reference ID: #RE-{Math.floor(Math.random() * 900000 + 100000)}</p>
                      </div>
                      <div className="w-full bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                        <Info className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-green-700 leading-relaxed">
                          Congratulations! Your payment of <strong>{formatCurrency(paymentAmount)}</strong> was successful. The property papers and payment receipt have been sent to your registered email.
                        </p>
                      </div>
                      <div className="flex flex-col w-full gap-2">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => handleDownloadInvoice(currentPaymentId, selectedEnquiryForPayment?.projectId?.name)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setShowPaymentModal(false)}>
                          Done
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 border-t flex space-x-3 bg-gray-50/30">
                {paymentStep === 'success' ? null : (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPaymentStep('plans');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                      onClick={handlePaymentAction}
                      disabled={!paymentAmount || paymentStep === 'processing'}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {paymentStep === 'plans' ? (paymentMethod === 'cash' ? 'Confirm Booking' : 'Proceed to Pay') : 'Confirm Payment'}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* Details Modal (Total Paid, Pending, Next Payment, User Details) */}
        {showDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b flex items-center justify-between bg-blue-50">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {detailsType === 'totalPaid' && <><Banknote className="h-6 w-6 text-green-600" /> Total Paid Breakdown</>}
                  {detailsType === 'pending' && <><Clock className="h-6 w-6 text-yellow-600" /> Pending Dues List</>}
                  {detailsType === 'nextPayment' && <><Calendar className="h-6 w-6 text-blue-600" /> Next Payment</>}
                  {detailsType === 'userDetails' && <><User className="h-6 w-6 text-blue-600" /> Customer Information</>}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/50"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {detailsType === 'userDetails' ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm">
                        {selectedUserDetails?.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-gray-900">{selectedUserDetails?.name}</h4>
                        <p className="text-gray-500 font-medium">Verified Customer</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-2xl bg-white shadow-sm flex items-start gap-3 h-full">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-1"><Smartphone className="h-5 w-5" /></div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Mobile Number</p>
                          <p className="font-bold text-gray-900 truncate">{selectedUserDetails?.phone}</p>
                        </div>
                      </div>
                      <div className="p-4 border rounded-2xl bg-white shadow-sm flex items-start gap-3 h-full">
                        <div className="p-2 bg-blue-50 text-primary rounded-lg shrink-0 mt-1"><FileText className="h-5 w-5" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
                          <p className="font-bold text-gray-900 break-all text-sm">{selectedUserDetails?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detailsData.length === 0 ? (
                      <div className="text-center py-10 text-gray-500 italic">No records found for this category.</div>
                    ) : (
                      detailsData.map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all hover:bg-white hover:shadow-md gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white border border-gray-200 text-blue-600 rounded-xl flex items-center justify-center font-bold shrink-0">
                              {item.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate">{item.name}</p>
                              <p className="text-[10px] md:text-xs text-gray-500 font-medium truncate">{item.phone} • {item.email}</p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right shrink-0 bg-white/50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                            <p className={`text-base md:text-lg font-black ${detailsType === 'pending' ? 'text-red-600' : 'text-blue-600'}`}>
                              {formatCurrency(detailsType === 'nextPayment' ? item.nextAmount : item.amount)}
                            </p>
                            {detailsType === 'nextPayment' && item.nextDate && (
                              <p className="text-[10px] font-bold text-blue-600">DUE: {formatDate(item.nextDate)}</p>
                            )}
                            {detailsType === 'totalPaid' && (
                              <p className="text-[10px] font-bold text-green-600 uppercase">Paid in full</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50/50 flex justify-end">
                <Button
                  className="bg-primary hover:bg-primary/90 font-bold min-w-[120px]"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close View
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentsPage;
