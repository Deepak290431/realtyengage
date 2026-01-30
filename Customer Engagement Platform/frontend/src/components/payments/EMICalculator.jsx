import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Slider,
  InputAdornment,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import {
  CurrencyRupee,
  Calculate,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  Payment,
  AccountBalanceWallet
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import paymentService from '../../services/paymentService';

const EMICalculator = ({ initialAmount = 5000000, onSelectEMI }) => {
  const [principal, setPrincipal] = useState(initialAmount);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(240); // months
  const [emiResult, setEmiResult] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateEMI = async () => {
    setLoading(true);
    try {
      const response = await paymentService.initiatePayment({
        method: 'POST',
        url: '/payments/calculate-emi',
        data: {
          principal,
          rate,
          tenure
        }
      });
      setEmiResult(response.data);
    } catch (error) {
      // Calculate locally if API fails
      const monthlyRate = rate / 12 / 100;
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                  (Math.pow(1 + monthlyRate, tenure) - 1);
      
      setEmiResult({
        monthlyEMI: Math.round(emi),
        totalAmount: Math.round(emi * tenure),
        totalInterest: Math.round(emi * tenure) - principal,
        principal,
        rate,
        tenure
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lacs`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getPieData = () => {
    if (!emiResult) return [];
    return [
      { name: 'Principal', value: emiResult.principal, color: '#1976d2' },
      { name: 'Interest', value: emiResult.totalInterest, color: '#ff9800' }
    ];
  };

  const handleApplyEMI = () => {
    if (onSelectEMI && emiResult) {
      onSelectEMI({
        monthlyAmount: emiResult.monthlyEMI,
        tenure: emiResult.tenure,
        rate: emiResult.rate
      });
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Calculate /> EMI Calculator
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Loan Amount: {formatCurrency(principal)}
            </Typography>
            <Slider
              value={principal}
              onChange={(e, newValue) => setPrincipal(newValue)}
              min={100000}
              max={50000000}
              step={100000}
              marks={[
                { value: 100000, label: '₹1L' },
                { value: 25000000, label: '₹2.5Cr' },
                { value: 50000000, label: '₹5Cr' }
              ]}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Interest Rate: {rate}% per annum
            </Typography>
            <Slider
              value={rate}
              onChange={(e, newValue) => setRate(newValue)}
              min={5}
              max={15}
              step={0.1}
              marks={[
                { value: 5, label: '5%' },
                { value: 10, label: '10%' },
                { value: 15, label: '15%' }
              ]}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Loan Tenure: {tenure} months ({Math.floor(tenure/12)} years {tenure%12} months)
            </Typography>
            <Slider
              value={tenure}
              onChange={(e, newValue) => setTenure(newValue)}
              min={12}
              max={360}
              step={12}
              marks={[
                { value: 12, label: '1Y' },
                { value: 180, label: '15Y' },
                { value: 360, label: '30Y' }
              ]}
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={calculateEMI}
            startIcon={<Calculate />}
            disabled={loading}
          >
            Calculate EMI
          </Button>
        </Grid>

        <Grid item xs={12} md={6}>
          {emiResult && (
            <>
              <Card sx={{ mb: 2, backgroundColor: 'primary.main', color: 'white' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Monthly EMI
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    {formatCurrency(emiResult.monthlyEMI)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    for {tenure} months
                  </Typography>
                </CardContent>
              </Card>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalanceWallet color="primary" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Principal
                          </Typography>
                          <Typography variant="h6">
                            {formatCurrency(emiResult.principal)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp color="warning" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Total Interest
                          </Typography>
                          <Typography variant="h6">
                            {formatCurrency(emiResult.totalInterest)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Total Payable Amount
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(emiResult.totalAmount)}
                  </Typography>
                  
                  {getPieData().length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={getPieData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {getPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {onSelectEMI && (
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={handleApplyEMI}
                  startIcon={<Payment />}
                >
                  Apply This EMI Plan
                </Button>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {emiResult && emiResult.breakdown && (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            <Typography variant="h6">
              EMI Breakdown (First Year)
            </Typography>
            <IconButton>
              {showBreakdown ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={showBreakdown}>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">EMI</TableCell>
                    <TableCell align="right">Principal</TableCell>
                    <TableCell align="right">Interest</TableCell>
                    <TableCell align="right">Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emiResult.breakdown?.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell align="right">{formatCurrency(row.emi)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.principal)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.interest)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </Box>
      )}

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="caption">
          * EMI calculations are approximate. Actual EMI may vary based on processing fees, 
          insurance, and other charges. Contact our sales team for exact details.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default EMICalculator;
