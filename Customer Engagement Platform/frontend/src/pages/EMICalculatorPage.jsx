import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calculator,
    IndianRupee,
    Calendar,
    Percent,
    ArrowLeft,
    TrendingUp,
    PieChart,
    Download,
    Share2,
    Info,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const EMICalculatorPage = ({ isAdmin = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Parse initial amount from URL if present
    const queryParams = new URLSearchParams(location.search);
    const initialAmount = parseInt(queryParams.get('amount')) || 5000000;

    const [loanAmount, setLoanAmount] = useState(initialAmount);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);
    const [emiResult, setEmiResult] = useState(null);

    const calculateEMI = () => {
        const principal = parseFloat(loanAmount);
        const rate = parseFloat(interestRate) / 100 / 12;
        const time = parseFloat(loanTenure) * 12;

        const emi = principal * rate * Math.pow(1 + rate, time) / (Math.pow(1 + rate, time) - 1);
        const totalAmount = emi * time;
        const totalInterest = totalAmount - principal;

        setEmiResult({
            emi: Math.round(emi),
            totalAmount: Math.round(totalAmount),
            totalInterest: Math.round(totalInterest),
            principal: principal
        });
    };

    useEffect(() => {
        calculateEMI();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
            {/* Header Section */}
            <div className="bg-[#0B1F33] text-white py-12 px-6">
                <div className="max-w-[1440px] mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Button
                                    variant="ghost"
                                    className="text-white hover:bg-white/10 -ml-2"
                                    onClick={() => navigate(-1)}
                                >
                                    <ArrowLeft className="h-5 w-5 mr-2" />
                                    Back
                                </Button>
                                <Badge className="bg-[#C9A24D] text-[#0B1F33] border-none font-bold">
                                    PROPERTY TOOLS
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black mb-2">Smart EMI Calculator</h1>
                            <p className="text-gray-400 font-medium">Plan your property financing with precision</p>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#C9A24D]/20 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-[#C9A24D]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Market Rate</p>
                                        <p className="text-lg font-black italic">8.5% p.a.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-12 mt-8">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Input Controls */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="p-6 md:p-8 shadow-2xl border-none ring-1 ring-gray-200 dark:ring-gray-800">
                            <h2 className="text-xl font-black text-[#0B1F33] dark:text-white mb-8 flex items-center gap-2">
                                <Calculator className="h-6 w-6 text-[#C9A24D]" />
                                Loan Parameters
                            </h2>

                            <div className="space-y-8">
                                {/* Loan Amount */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loan Amount</label>
                                        <span className="text-xl font-black text-primary">{formatCurrency(loanAmount)}</span>
                                    </div>
                                    <div className="relative pt-2">
                                        <input
                                            type="range"
                                            min="100000"
                                            max="100000000"
                                            step="100000"
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C9A24D]"
                                        />
                                        <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                                            <span>1 LAKH</span>
                                            <span>10 CR</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            type="number"
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(parseInt(e.target.value) || 0)}
                                            className="pl-10 h-12 font-bold focus:ring-2 focus:ring-[#C9A24D]"
                                        />
                                    </div>
                                </div>

                                {/* Interest Rate */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Interest Rate (% p.a)</label>
                                        <span className="text-xl font-black text-primary">{interestRate}%</span>
                                    </div>
                                    <div className="relative pt-2">
                                        <input
                                            type="range"
                                            min="5"
                                            max="20"
                                            step="0.1"
                                            value={interestRate}
                                            onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C9A24D]"
                                        />
                                        <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                                            <span>5%</span>
                                            <span>20%</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={interestRate}
                                            onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                                            className="pl-10 h-12 font-bold"
                                        />
                                    </div>
                                </div>

                                {/* Loan Tenure */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tenure (Years)</label>
                                        <span className="text-xl font-black text-primary">{loanTenure} YRS</span>
                                    </div>
                                    <div className="relative pt-2">
                                        <input
                                            type="range"
                                            min="1"
                                            max="30"
                                            value={loanTenure}
                                            onChange={(e) => setLoanTenure(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C9A24D]"
                                        />
                                        <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                                            <span>1 YR</span>
                                            <span>30 YRS</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            type="number"
                                            value={loanTenure}
                                            onChange={(e) => setLoanTenure(parseInt(e.target.value) || 0)}
                                            className="pl-10 h-12 font-bold"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={calculateEMI}
                                    className="w-full h-14 bg-[#0B1F33] hover:bg-[#152e4a] text-white font-black text-lg rounded-2xl shadow-xl shadow-[#0B1F33]/20 transition-all active:scale-[0.98]"
                                >
                                    <Calculator className="h-6 w-6 mr-2" />
                                    Update Calculation
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Results Display */}
                    <div className="lg:col-span-7 space-y-6 pb-12">
                        {emiResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Main EMI Card */}
                                <Card className="overflow-hidden border-none shadow-2xl shadow-primary/10 relative">
                                    <div className="bg-gradient-to-br from-[#0B1F33] via-[#152e4a] to-[#0B1F33] p-8 md:p-12 text-white relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Calculator className="h-40 w-40" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[10px] md:text-sm font-black text-[#C9A24D] uppercase tracking-[0.3em] mb-4">Your Estimated Monthly EMI</p>
                                            <div className="flex items-baseline gap-2">
                                                <IndianRupee className="h-8 w-8 md:h-12 md:w-12 text-[#C9A24D]" />
                                                <h3 className="text-5xl md:text-7xl font-black tracking-tighter">
                                                    {emiResult.emi.toLocaleString('en-IN')}
                                                </h3>
                                                <span className="text-xl md:text-2xl text-gray-400 font-bold opacity-60">/ Month</span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/10">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Principal</p>
                                                    <p className="text-lg font-black">{formatCurrency(emiResult.principal)}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Interest</p>
                                                    <p className="text-lg font-black text-[#C9A24D]">{formatCurrency(emiResult.totalInterest)}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Payable</p>
                                                    <p className="text-lg font-black">{formatCurrency(emiResult.totalAmount)}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Installments</p>
                                                    <p className="text-lg font-black">{loanTenure * 12} PM</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white dark:bg-gray-800 flex flex-wrap gap-4 items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <div className="w-3 h-3 rounded-full bg-[#0B1F33]"></div>
                                            <span>Principal: {Math.round((emiResult.principal / emiResult.totalAmount) * 100)}%</span>
                                            <div className="w-3 h-3 rounded-full bg-[#C9A24D] ml-4"></div>
                                            <span>Interest: {Math.round((emiResult.totalInterest / emiResult.totalAmount) * 100)}%</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="font-bold border-gray-200">
                                                <Share2 className="h-4 w-4 mr-2" />
                                                Share
                                            </Button>
                                            <Button variant="outline" size="sm" className="font-bold border-gray-200">
                                                <Download className="h-4 w-4 mr-2" />
                                                PDF
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                {/* Additional Stats */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Card className="p-5 border-none bg-blue-50 dark:bg-blue-900/10 flex items-start gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                                            <PieChart className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#0B1F33] dark:text-white uppercase text-[10px] tracking-widest mb-1">Financial Tip</h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                                Prepaying 1 extra EMI every year can reduce your loan tenure by <span className="text-blue-600 font-bold">~3.5 years</span>.
                                            </p>
                                        </div>
                                    </Card>
                                    <Card className="p-5 border-none bg-amber-50 dark:bg-amber-900/10 flex items-start gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                                            <ShieldCheck className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#0B1F33] dark:text-white uppercase text-[10px] tracking-widest mb-1">Eligibility</h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                                Recommended monthly income for this loan: <span className="text-amber-600 font-bold">{formatCurrency(emiResult.emi * 2)}</span>
                                            </p>
                                        </div>
                                    </Card>
                                </div>

                                {/* Amortization Preview */}
                                <Card className="p-6 border-none ring-1 ring-gray-100 dark:ring-gray-800">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                                            <Info className="h-5 w-5 text-primary" />
                                            Why use our calculator?
                                        </h3>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase">
                                                <CheckCircle2 className="h-4 w-4" /> Accurate
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium">Standardized IRR calculations matching most Indian banks.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase">
                                                <CheckCircle2 className="h-4 w-4" /> Real-time
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium">Instant updates as you slide to find your perfect budget.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase">
                                                <CheckCircle2 className="h-4 w-4" /> Detailed
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium">Full breakdown of principal vs interest components.</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Badge = ({ children, className }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] ${className}`}>
        {children}
    </span>
);

export default EMICalculatorPage;
