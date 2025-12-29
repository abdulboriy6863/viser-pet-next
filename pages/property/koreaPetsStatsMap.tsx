import React, { useMemo, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { Stack, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
} from 'recharts';
import { petStatsVar } from '../../apollo/store';

type CityStat = { label: string; value: number };

const fallbackData: CityStat[] = [
	{ label: 'Seoul', value: 210 },
	{ label: 'Busan', value: 120 },
	{ label: 'Incheon', value: 90 },
	{ label: 'Daegu', value: 80 },
	{ label: 'Others', value: 160 },
];

const COLORS = ['#111827', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

const CITY_POINTS = [
	{ key: 'Seoul', x: 56, y: 26 },
	{ key: 'Incheon', x: 48, y: 27 },
	{ key: 'Daegu', x: 62, y: 60 },
	{ key: 'Busan', x: 70, y: 72 },
] as const;

export default function KoreaPetStatsMap() {
	const wsData = useReactiveVar(petStatsVar);
	const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
	const [activeCity, setActiveCity] = useState<string>('ALL');

	const finalData: CityStat[] = wsData?.length ? wsData : fallbackData;

	const total = useMemo(() => finalData.reduce((sum, r) => sum + (Number(r.value) || 0), 0), [finalData]);

	const filtered = useMemo(() => {
		if (activeCity === 'ALL') return finalData;
		return finalData.filter((r) => r.label === activeCity);
	}, [finalData, activeCity]);

	return (
		<Stack className="kr-petstats">
			<Stack className="kr-petstats__head">
				<Stack>
					<Typography className="title">Korea Pet Owners (Real-time)</Typography>
					<Typography className="subtitle">
						Seoul, Busan, Incheon, Daegu + Others • Total: {total.toLocaleString()}
					</Typography>
				</Stack>

				<ToggleButtonGroup size="small" exclusive value={chartType} onChange={(_, v) => v && setChartType(v)}>
					<ToggleButton value="pie">PIE</ToggleButton>
					<ToggleButton value="bar">BAR</ToggleButton>
				</ToggleButtonGroup>
			</Stack>

			<Stack className="kr-petstats__body">
				{/* LEFT: MAP */}
				<Stack className="kr-map">
					<Stack className="kr-map__top">
						<Typography className="kr-map__title">Korea Map</Typography>
						<Stack className="kr-map__chips">
							<button
								type="button"
								className={`chip ${activeCity === 'ALL' ? 'active' : ''}`}
								onClick={() => setActiveCity('ALL')}
							>
								ALL
							</button>
							{CITY_POINTS.map((c) => (
								<button
									key={c.key}
									type="button"
									className={`chip ${activeCity === c.key ? 'active' : ''}`}
									onClick={() => setActiveCity(c.key)}
								>
									{c.key}
								</button>
							))}
						</Stack>
					</Stack>

					<div className="kr-map__svgWrap">
						{/* decorative simplified KR silhouette (UI uchun) */}
						<svg viewBox="0 0 100 120" className="kr-map__svg" role="img" aria-label="Korea map">
							<path
								d="M58 6
                   C50 10,46 14,44 20
                   C41 30,34 30,30 38
                   C26 45,28 52,32 58
                   C36 64,36 70,32 76
                   C26 86,30 96,38 102
                   C46 110,54 112,60 118
                   C70 112,74 104,72 96
                   C70 88,76 82,74 74
                   C72 66,64 62,64 54
                   C64 44,72 38,70 28
                   C68 18,66 10,58 6 Z"
								className="kr-map__land"
							/>

							{/* City points */}
							{CITY_POINTS.map((c, idx) => {
								const isActive = activeCity === c.key;
								return (
									<g
										key={c.key}
										className={`kr-map__pt ${isActive ? 'active' : ''}`}
										onClick={() => setActiveCity(c.key)}
										style={{ cursor: 'pointer' }}
									>
										<circle cx={c.x} cy={c.y} r={isActive ? 2.6 : 2.1} className="dot" />
										<text x={c.x + 2.5} y={c.y + 1.2} className="label">
											{c.key}
										</text>
									</g>
								);
							})}
						</svg>
					</div>

					<Typography className="kr-map__hint">City’ni bos → chart faqat shu city bo‘yicha ko‘rsatadi.</Typography>
				</Stack>

				{/* RIGHT: CHART */}
				<Stack className="kr-chart">
					<Stack className="kr-chart__titleRow">
						<Typography className="kr-chart__title">{activeCity === 'ALL' ? 'All Cities' : activeCity}</Typography>
					</Stack>

					<div className="kr-chart__box">
						{chartType === 'pie' ? (
							<ResponsiveContainer width="100%" height={380}>
								<PieChart>
									<Tooltip />
									<Legend />
									<Pie
										data={filtered}
										dataKey="value"
										nameKey="label"
										innerRadius="55%"
										outerRadius="80%"
										isAnimationActive
										animationBegin={100}
										animationDuration={900}
										animationEasing="ease-out"
									>
										{filtered.map((_, i) => (
											<Cell key={i} fill={COLORS[i % COLORS.length]} />
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>
						) : (
							<ResponsiveContainer width="100%" height={380}>
								<BarChart data={filtered}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="label" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar
										dataKey="value"
										isAnimationActive
										animationBegin={100}
										animationDuration={900}
										animationEasing="ease-out"
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</div>
				</Stack>
			</Stack>
		</Stack>
	);
}
