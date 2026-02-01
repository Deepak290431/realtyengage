import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  CurrencyRupee,
  CreditCard,
  AccountBalance,
  PhoneAndroid,
  Receipt,
  Calculate,
  Close
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import paymentService from '../../services/paymentService';

const steps = ['Payment Details', 'Choose Method', 'Confirm & Pay'];

const PaymentModal = ({ open, onClose, project, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({});

  const { user } = useSelector((state) => state.auth);
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

  const paymentType = watch('paymentType');
  const amount = watch('amount');

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setPaymentData({});
      reset();
    }
  }, [open, reset]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmitDetails = (data) => {
    setPaymentData({ ...paymentData, ...data });
    handleNext();
  };

  const onSelectMethod = (method) => {
    setPaymentData({ ...paymentData, method });
    handleNext();
  };

  const processPayment = async () => {
    setLoading(true);
    try {
      // Initiate payment
      const initiateResponse = await paymentService.initiatePayment({
        projectId: project._id,
        amount: paymentData.amount,
        paymentType: paymentData.paymentType,
        method: paymentData.method
      });

      if (['card', 'upi'].includes(paymentData.method)) {
        // Open Razorpay checkout
        const paymentResult = await paymentService.openRazorpayCheckout(
          {
            razorpayKey: initiateResponse.data.razorpayKey,
            razorpayOrderId: initiateResponse.data.razorpayOrderId,
            customerName: user.firstName + ' ' + user.lastName,
            customerEmail: user.email,
            customerPhone: user.phone
          },
          {
            amount: paymentData.amount,
            projectName: project.name
          }
        );

        // Verify payment
        const verifyResponse = await paymentService.verifyPayment({
          paymentId: paymentResult.razorpay_payment_id,
          orderId: initiateResponse.data.razorpayOrderId,
          signature: paymentResult.razorpay_signature
        });

        toast.success('Payment successful!');
        onSuccess && onSuccess(verifyResponse.data);
        onClose();
      } else {
        // For offline payment methods
        toast.success('Payment request submitted successfully!');
        onSuccess && onSuccess(initiateResponse.data);
        onClose();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentDetails = () => (
    <Box component="form" onSubmit={handleSubmit(onSubmitDetails)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Project"
            value={project?.name || ''}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBalance />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.paymentType}>
            <InputLabel>Payment Type</InputLabel>
            <Select
              {...register('paymentType', { required: 'Payment type is required' })}
              defaultValue=""
              label="Payment Type"
            >
              <MenuItem value="booking">Booking Amount</MenuItem>
              <MenuItem value="down_payment">Down Payment</MenuItem>
              <MenuItem value="emi">EMI</MenuItem>
              <MenuItem value="full_payment">Full Payment</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {errors.paymentType && (
              <Typography variant="caption" color="error">
                {errors.paymentType.message}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Amount"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 1, message: 'Amount must be greater than 0' }
            })}
            error={!!errors.amount}
            helperText={errors.amount?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyRupee />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {paymentType === 'booking' && (
          <Grid item xs={12}>
            <Alert severity="info">
              Standard booking amount is 10% of the property value
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Notes (Optional)"
            {...register('notes')}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained">
          Continue
        </Button>
      </Box>
    </Box>
  );

  const renderPaymentMethod = () => {
    const methods = [
      { value: 'card', label: 'Credit/Debit Card', icon: <CreditCard />, online: true },
      { value: 'upi', label: 'UPI', icon: <PhoneAndroid />, online: true },
      { value: 'bank_transfer', label: 'Bank Transfer', icon: <AccountBalance />, online: false },
      { value: 'cheque', label: 'Cheque', icon: <Receipt />, online: false },
    ];

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Choose Payment Method
        </Typography>
        <Grid container spacing={2}>
          {methods.map((method) => (
            <Grid item xs={12} sm={6} key={method.value}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover'
                  }
                }}
                onClick={() => onSelectMethod(method.value)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {method.icon}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">{method.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {method.online ? 'Instant Payment' : 'Offline Payment'}
                      </Typography>
                    </Box>
                    {method.online && (
                      <Chip label="Recommended" size="small" color="primary" />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleBack}>Back</Button>
          <Button onClick={onClose}>Cancel</Button>
        </Box>
      </Box>
    );
  };

  const renderConfirmation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Confirm Payment Details
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Project
              </Typography>
              <Typography variant="body1">{project?.name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">{project?.area}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Payment Type
              </Typography>
              <Typography variant="body1">
                {paymentData.paymentType?.replace('_', ' ').toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Payment Method
              </Typography>
              <Typography variant="body1">
                {paymentData.method?.replace('_', ' ').toUpperCase()}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Total Amount</Typography>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
              ₹{Number(paymentData.amount).toLocaleString('en-IN')}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {['bank_transfer', 'cheque'].includes(paymentData.method) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          For {paymentData.method === 'bank_transfer' ? 'bank transfer' : 'cheque'} payments,
          you will receive payment instructions via email. The payment will be confirmed after verification.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleBack} disabled={loading}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={processPayment}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : 'Make Payment'}
        </Button>
      </Box>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPaymentDetails();
      case 1:
        return renderPaymentMethod();
      case 2:
        return renderConfirmation();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Make Payment</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
