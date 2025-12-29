// import React, { useEffect, useState } from 'react';
// import { useReactiveVar } from '@apollo/client';
// import { petStatsVar } from '../../apollo/store';

// import { Stack, Typography, ToggleButton, ToggleButtonGroup, CircularProgress } from '@mui/material';
// import {
// 	ResponsiveContainer,
// 	PieChart,
// 	Pie,
// 	Cell,
// 	Tooltip,
// 	Legend,
// 	BarChart,
// 	Bar,
// 	XAxis,
// 	YAxis,
// 	CartesianGrid,
// } from 'recharts';

// type CityStat = {
// 	label: string;
// 	value: number;
// };

// const fallbackData: CityStat[] = [
// 	{ label: 'Seoul', value: 210 },
// 	{ label: 'Busan', value: 120 },
// 	{ label: 'Incheon', value: 90 },
// 	{ label: 'Daegu', value: 80 },
// 	{ label: 'Others', value: 160 },
// ];

// const COLORS = ['#111827', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

// const KoreaPetStats = () => {
// 	const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
// 	const [loading, setLoading] = useState(true);
// 	const [data, setData] = useState<CityStat[]>(fallbackData);

// 	// 🔥 WebSocket real-time data
// 	const wsData = useReactiveVar(petStatsVar);

// 	// 🔁 Qaysi data ishlatiladi
// 	const finalData: CityStat[] = wsData.length ? wsData : data;

// 	useEffect(() => {
// 		let active = true;

// 		const fetchStats = async () => {
// 			try {
// 				setLoading(true);
// 				const res = await fetch('/api/pet-stats-kr-cities');
// 				if (!res.ok) throw new Error('failed');
// 				const json = await res.json();

// 				if (active && Array.isArray(json?.rows)) {
// 					setData(json.rows);
// 				}
// 			} catch {
// 				// fallback ishlayveradi
// 			} finally {
// 				if (active) setLoading(false);
// 			}
// 		};

// 		fetchStats();
// 		const timer = setInterval(fetchStats, 60000);

// 		return () => {
// 			active = false;
// 			clearInterval(timer);
// 		};
// 	}, []);

// 	return (
// 		<Stack className="pet-stats-config">
// 			<Stack className="pet-stats-head">
// 				<Typography className="title">Korea Pet Owners by City</Typography>

// 				<ToggleButtonGroup size="small" exclusive value={chartType} onChange={(_, v) => v && setChartType(v)}>
// 					<ToggleButton value="pie">PIE</ToggleButton>
// 					<ToggleButton value="bar">BAR</ToggleButton>
// 				</ToggleButtonGroup>
// 			</Stack>

// 			<Typography className="subtitle">Seoul, Busan, Incheon, Daegu + Others (real-time)</Typography>

// 			<Stack className="chart-box">
// 				{loading && !wsData.length ? (
// 					<Stack className="loading">
// 						<CircularProgress />
// 					</Stack>
// 				) : chartType === 'pie' ? (
// 					<ResponsiveContainer width="100%" height={380}>
// 						<PieChart>
// 							<Tooltip />
// 							<Legend />
// 							<Pie data={finalData} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="80%">
// 								{finalData.map((_, i) => (
// 									<Cell key={i} fill={COLORS[i % COLORS.length]} />
// 								))}
// 							</Pie>
// 						</PieChart>
// 					</ResponsiveContainer>
// 				) : (
// 					<ResponsiveContainer width="100%" height={380}>
// 						<BarChart data={finalData}>
// 							<CartesianGrid strokeDasharray="3 3" />
// 							<XAxis dataKey="label" />
// 							<YAxis />
// 							<Tooltip />
// 							<Legend />
// 							<Bar dataKey="value" />
// 						</BarChart>
// 					</ResponsiveContainer>
// 				)}
// 			</Stack>
// 		</Stack>
// 	);
// };

// export default KoreaPetStats;
