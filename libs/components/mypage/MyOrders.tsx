import React from 'react';
import { Stack, Typography, Button } from '@mui/material';

type Order = {
	id: string;
	title: string;
	status: 'Processing' | 'Shipped' | 'Delivered';
	total: string;
	items: number;
	eta: string;
};

const orders: Order[] = [
	{
		id: 'ORD-1042',
		title: 'Winter dog coat & travel harness',
		status: 'Shipped',
		total: '$168.00',
		items: 3,
		eta: 'Arrives Jan 22',
	},
	{
		id: 'ORD-1041',
		title: 'Smart feeder & filters pack',
		status: 'Processing',
		total: '$94.00',
		items: 2,
		eta: 'Preparing to ship',
	},
	{
		id: 'ORD-1039',
		title: 'Noise-cancelling headphones for pets',
		status: 'Delivered',
		total: '$129.00',
		items: 1,
		eta: 'Delivered Jan 8',
	},
];

const MyOrders = () => {
	return (
		<Stack className="my-orders" spacing={3}>
			<Stack className="orders-header" direction="row" alignItems="center" justifyContent="space-between">
				<div>
					<p className="eyebrow">Orders</p>
					<Typography variant="h4" component="h3" className="orders-title">
						My Orders
					</Typography>
					<p className="orders-subtitle">Track purchases, delivery status, and receipts in one place.</p>
				</div>
				<Button className="orders-button" variant="outlined">
					View invoices
				</Button>
			</Stack>

			<div className="orders-grid">
				{orders.map((order) => (
					<div key={order.id} className="order-card">
						<div className="order-top">
							<span className="order-id">{order.id}</span>
							<span className={`order-status order-status--${order.status.toLowerCase()}`}>{order.status}</span>
						</div>

						<div className="order-body">
							<Typography className="order-title" component="h4">
								{order.title}
							</Typography>

							<div className="order-meta">
								<span>{order.items} item{order.items > 1 ? 's' : ''}</span>
								<span className="order-total">{order.total}</span>
							</div>
						</div>

						<div className="order-footer">
							<span className="order-eta">{order.eta}</span>
							<button className="order-link" type="button">
								View details
							</button>
						</div>
					</div>
				))}
			</div>
		</Stack>
	);
};

export default MyOrders;
