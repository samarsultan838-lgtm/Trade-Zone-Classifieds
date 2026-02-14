
import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Maximize, 
  FileSearch, 
  Hammer, 
  ChevronRight, 
  Info, 
  TrendingUp, 
  Building2, 
  ArrowRightLeft,
  PieChart as PieChartIcon,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type ToolId = 'loan' | 'area' | 'land' | 'construction';

const TrazotTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolId>('loan');

  // --- Home Loan State ---
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(12);
  const [loanTerm, setLoanTerm] = useState(20);

  const emiData = useMemo(() => {
    const r = interestRate / 12 / 100;
    const n = loanTerm * 12;
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - loanAmount;

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      chart: [
        { name: 'Principal', value: loanAmount, color: '#17933f' },
        { name: 'Interest', value: totalInterest, color: '#f59e0b' },
      ]
    };
  }, [loanAmount, interestRate, loanTerm]);

  // --- Area Converter State ---
  const [areaValue, setAreaValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState('Marla');
  const [toUnit, setToUnit] = useState('Sq. Ft.');

  const areaUnits: Record<string, number> = {
    'Sq. Ft.': 1,
    'Marla': 225,
    'Kanal': 4500,
    'Acre': 43560,
    'Sq. Meter': 10.7639,
  };

  const convertedArea = useMemo(() => {
    const inSqft = areaValue * areaUnits[fromUnit];
    return (inSqft / areaUnits[toUnit]).toFixed(2);
  }, [areaValue, fromUnit, toUnit]);

  // --- Construction Calculator State ---
  const [buildArea, setBuildArea] = useState(2000);
  const [finishQuality, setFinishQuality] = useState<'Standard' | 'Premium' | 'Luxury'>('Standard');
  const rates = { Standard: 3500, Premium: 5500, Luxury: 8500 };

  const constructionCost = useMemo(() => {
    const total = buildArea * rates[finishQuality];
    return {
      total,
      materials: total * 0.6,
      labor: total * 0.25,
      finishing: total * 0.15
    };
  }, [buildArea, finishQuality]);

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-in fade-in duration-700">
      <header className="mb-12">
        <h1 className="text-4xl font-serif-italic text-emerald-950 mb-2">
          Trazot <span className="text-[#17933f]">Intelligence Suite</span>
        </h1>
        <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">
          Professional utilities for high-fidelity asset management
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {[
            { id: 'loan', icon: <Calculator />, label: 'Home Loan Calculator' },
            { id: 'area', icon: <ArrowRightLeft />, label: 'Area Unit Converter' },
            { id: 'land', icon: <FileSearch />, label: 'Land Record Pages' },
            { id: 'construction', icon: <Hammer />, label: 'Construction Cost' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ToolId)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] transition-all text-sm font-bold ${
                activeTool === tool.id 
                ? 'bg-[#17933f] text-white shadow-xl shadow-emerald-600/20 scale-[1.02]' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <span className={activeTool === tool.id ? 'text-white' : 'text-emerald-600'}>
                {tool.icon}
              </span>
              {tool.label}
            </button>
          ))}

          <div className="mt-8 p-6 bg-emerald-950 rounded-[32px] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#17933f] rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2" />
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Need Help?</h4>
            <p className="text-[10px] text-emerald-100/60 leading-relaxed font-medium">
              Connect with our verification agents for human-verified asset valuation.
            </p>
            <button className="mt-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group">
              Expert Consultation <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Main Tool Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm min-h-[600px] relative overflow-hidden">
            
            {/* 1. Home Loan Calculator */}
            {activeTool === 'loan' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-emerald-950">EMI Engine</h2>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5" /> Market Rates Applied
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Principal Amount</label>
                        <span className="text-sm font-black text-emerald-950">PKR {loanAmount.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" min="100000" max="50000000" step="100000"
                        value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#17933f]"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Interest Rate (P.A)</label>
                        <span className="text-sm font-black text-emerald-950">{interestRate}%</span>
                      </div>
                      <input 
                        type="range" min="5" max="25" step="0.5"
                        value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#17933f]"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Loan Tenure</label>
                        <span className="text-sm font-black text-emerald-950">{loanTerm} Years</span>
                      </div>
                      <input 
                        type="range" min="1" max="30" step="1"
                        value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))}
                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#17933f]"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-[32px] p-8 border border-gray-100 flex flex-col items-center">
                    <div className="h-48 w-full mb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={emiData.chart}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {emiData.chart.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Monthly EMI</span>
                      <div className="text-4xl font-black text-emerald-950">PKR {emiData.monthlyEmi.toLocaleString()}</div>
                    </div>
                    <div className="w-full mt-8 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center">
                        <span className="block text-[8px] font-black text-gray-400 uppercase mb-1">Total Interest</span>
                        <span className="text-xs font-black text-amber-600">PKR {emiData.totalInterest.toLocaleString()}</span>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center">
                        <span className="block text-[8px] font-black text-gray-400 uppercase mb-1">Total Payment</span>
                        <span className="text-xs font-black text-[#17933f]">PKR {emiData.totalPayment.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Area Unit Converter */}
            {activeTool === 'area' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-emerald-950">Unit Conversion Portal</h2>
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Maximize className="w-6 h-6" />
                  </div>
                </div>

                <div className="max-w-xl mx-auto space-y-8">
                  <div className="bg-gray-50 rounded-[32px] p-10 space-y-8 border border-gray-100">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Input Dimension</label>
                      <div className="flex gap-4">
                        <input 
                          type="number" 
                          value={areaValue}
                          onChange={(e) => setAreaValue(Number(e.target.value))}
                          className="flex-1 bg-white rounded-2xl p-5 font-black text-emerald-950 outline-none shadow-sm focus:ring-2 focus:ring-[#17933f]" 
                        />
                        <select 
                          value={fromUnit}
                          onChange={(e) => setFromUnit(e.target.value)}
                          className="w-32 bg-white rounded-2xl p-5 font-bold text-gray-600 outline-none shadow-sm cursor-pointer"
                        >
                          {Object.keys(areaUnits).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-12 h-12 bg-[#17933f] text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <ArrowRightLeft className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Target Dimension</label>
                      <div className="flex gap-4">
                        <div className="flex-1 bg-white rounded-2xl p-5 font-black text-emerald-950 shadow-sm border border-emerald-100 flex items-center">
                          {convertedArea}
                        </div>
                        <select 
                          value={toUnit}
                          onChange={(e) => setToUnit(e.target.value)}
                          className="w-32 bg-white rounded-2xl p-5 font-bold text-gray-600 outline-none shadow-sm cursor-pointer"
                        >
                          {Object.keys(areaUnits).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(areaUnits).map(unit => (
                      <button 
                        key={unit}
                        onClick={() => setToUnit(unit)}
                        className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          toUnit === unit ? 'bg-emerald-600 text-white border-transparent' : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Land Record Directory */}
            {activeTool === 'land' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-emerald-950">Land Registry Access</h2>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official Gateways Only
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { country: 'Pakistan', region: 'Punjab', agency: 'PLRA (Zameen)', link: 'https://www.punjab-zameen.gov.pk/' },
                    { country: 'Pakistan', region: 'Sindh', agency: 'LARMIS', link: 'https://sindhzameen.gos.pk/' },
                    { country: 'UAE', region: 'Dubai', agency: 'Dubai Land Dept', link: 'https://dubailand.gov.ae/' },
                    { country: 'UAE', region: 'Abu Dhabi', agency: 'DARI Portal', link: 'https://www.dari.ae/' },
                    { country: 'Saudi Arabia', region: 'National', agency: 'Ejar Portal', link: 'https://www.ejar.sa/' },
                    { country: 'India', region: 'National', agency: 'BHOOMI / IGR', link: 'https://bhulekh.gov.in/' },
                  ].map((portal, i) => (
                    <a 
                      key={i} 
                      href={portal.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group bg-gray-50 hover:bg-[#17933f] rounded-[32px] p-8 border border-gray-100 transition-all duration-500 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-white" />
                      </div>
                      <div className="mt-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 group-hover:text-emerald-200">{portal.country} • {portal.region}</span>
                        <h4 className="text-lg font-bold text-emerald-950 group-hover:text-white mt-1">{portal.agency}</h4>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 flex items-center gap-6">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                      <Zap className="w-6 h-6" />
                   </div>
                   <div>
                      <h5 className="font-bold text-emerald-900 mb-1">Instant Verification Protocol</h5>
                      <p className="text-xs text-emerald-700 font-medium">Always verify the URL matches the official government TLD (e.g., .gov.ae, .gov.pk) before entering asset details.</p>
                   </div>
                </div>
              </div>
            )}

            {/* 4. Construction Cost Calculator */}
            {activeTool === 'construction' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-emerald-950">Development Estimator</h2>
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Hammer className="w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Construction Area (Sq. Ft.)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="number" 
                          value={buildArea}
                          onChange={(e) => setBuildArea(Number(e.target.value))}
                          className="w-full bg-gray-50 rounded-2xl p-5 font-black text-emerald-950 outline-none border-2 border-transparent focus:border-[#17933f] transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Finish Quality Grade</label>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.keys(rates).map((grade) => (
                          <button
                            key={grade}
                            onClick={() => setFinishQuality(grade as any)}
                            className={`p-4 rounded-2xl transition-all border ${
                              finishQuality === grade 
                              ? 'bg-[#17933f] text-white border-transparent shadow-lg' 
                              : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200'
                            }`}
                          >
                            <span className="block text-[10px] font-black uppercase tracking-widest">{grade}</span>
                            <span className={`text-[8px] font-bold mt-1 block opacity-60 ${finishQuality === grade ? 'text-white' : 'text-gray-400'}`}>Grade</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#eaf7ed] p-8 rounded-[32px] border border-emerald-100">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4">Cost Breakdown</h5>
                      <div className="space-y-4">
                        {[
                          { label: 'Materials (60%)', value: constructionCost.materials },
                          { label: 'Labor (25%)', value: constructionCost.labor },
                          { label: 'Finishing (15%)', value: constructionCost.finishing },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-emerald-800/60">{item.label}</span>
                            <span className="font-black text-emerald-900">PKR {Math.round(item.value).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-950 text-white rounded-[40px] p-10 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#17933f] rounded-full blur-[60px] opacity-30" />
                    <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center mb-8">
                       <Calculator className="w-10 h-10 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-4">Estimated Total Investment</span>
                    <div className="text-4xl font-black mb-2">PKR {constructionCost.total.toLocaleString()}</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-200 opacity-60">
                      <CheckCircle2 className="w-4 h-4" /> Based on 2024 Market Data
                    </div>
                    <p className="mt-8 text-[10px] text-emerald-100/40 font-medium leading-relaxed max-w-[200px]">
                      Estimates include structural and non-structural components but exclude land acquisition costs.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default TrazotTools;
