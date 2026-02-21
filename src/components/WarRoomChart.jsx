import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Map } from 'lucide-react';
import { useUIStore } from '../store';
import { useCurrency } from '../hooks/useCurrency';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const WarRoomChart = ({ dataPoints }) => {
    const { theme } = useUIStore();
    const { formatCurrency } = useCurrency();
    const isLight = theme === 'light';
    const hasData = dataPoints?.values && dataPoints.values.length > 0;

    if (!hasData) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center border-2 border-dashed border-[var(--glass-border)] rounded-2xl bg-[var(--card-bg)]">
                <div className="text-amber-500/20 mb-4 animate-pulse">
                    <Map size={48} />
                </div>
                <p className="text-[10px] font-ancient font-black text-slate-600 uppercase tracking-[0.3em]">En attente de données de conquête...</p>
                <p className="text-[8px] text-slate-500 mt-2 uppercase tracking-widest font-bold">Inscrivez vos premières transactions pour cartographier votre empire</p>
            </div>
        );
    }

    const chartData = {
        labels: dataPoints.labels,
        datasets: [
            {
                label: 'Fortune Nette',
                data: dataPoints.values,
                fill: true,
                borderColor: '#f59e0b',
                borderWidth: 3,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
                    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
                    return gradient;
                },
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: isLight ? '#fff' : '#020617',
                pointHoverRadius: 8,
            }
        ],
    };


    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(2, 6, 23, 0.9)',
                titleColor: isLight ? '#0f172a' : '#fff',
                bodyColor: isLight ? '#475569' : '#94a3b8',
                titleFont: { family: 'Cinzel', size: 14 },
                bodyFont: { family: 'JetBrains Mono', size: 12 },
                borderColor: 'rgba(245, 158, 11, 0.3)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => ` Trésor: ${formatCurrency(context.raw)}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: isLight ? '#64748b' : '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } },
            },
            y: {
                grid: { color: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.03)' },
                ticks: {
                    color: isLight ? '#64748b' : '#94a3b8',
                    font: { family: 'JetBrains Mono', size: 10 },
                    callback: (value) => {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                        return value;
                    },
                },
            },
        },
    };

    return (
        <div className="h-full w-full min-h-[300px]">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default WarRoomChart;
