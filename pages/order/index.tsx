import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Box, Typography, Button, Divider } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ShoppingCartCheckoutOutlinedIcon from '@mui/icons-material/ShoppingCartCheckoutOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'on-hold';

type OrderItem = {
	id: string;
	product: string;
	sku: string;
	placedOn: string;
	unitPrice: number;
	quantity: number;
	status: OrderStatus;
	eta: string;
	thumbnail: string;
};

const statusConfig: Record<OrderStatus, { label: string; className: 'process' | 'finish' | 'pause'; description: string }> = {
	processing: { label: 'Processing', className: 'process', description: 'Payment confirmed • Packing now' },
	shipped: { label: 'Shipped', className: 'process', description: 'Handed to carrier • Tracking live' },
	delivered: { label: 'Delivered', className: 'finish', description: 'Signed by customer • Completed' },
	'on-hold': { label: 'On hold', className: 'pause', description: 'Awaiting restock • Customer notified' },
};

const orderItems: OrderItem[] = [
	{
		id: 'ORD-20914',
		product: 'Smart Feeder Pro (Wi‑Fi)',
		sku: 'SKU-FDR-552',
		placedOn: 'Feb 8, 2024, 09:24',
		unitPrice: 189,
		quantity: 1,
		status: 'processing',
		eta: 'Preparing shipment • ETA Feb 12',
		thumbnail: '/img/property/dog2.jpg',
	},
	{
		id: 'ORD-20906',
		product: 'GPS Tracker Collar v3',
		sku: 'SKU-GPS-318',
		placedOn: 'Feb 6, 2024, 14:10',
		unitPrice: 129,
		quantity: 2,
		status: 'shipped',
		eta: 'Out for delivery • Carrier: UPS',
		thumbnail: '/img/property/dog3.webp',
	},
	{
		id: 'ORD-20892',
		product: 'AutoClean Litter Box',
		sku: 'SKU-CAT-210',
		placedOn: 'Feb 4, 2024, 11:35',
		unitPrice: 249,
		quantity: 1,
		status: 'delivered',
		eta: 'Delivered Feb 10 • Left at reception',
		thumbnail: '/img/property/cat2.jpg',
	},
	{
		id: 'ORD-20871',
		product: 'Cooling Pet Bed (M)',
		sku: 'SKU-BED-404',
		placedOn: 'Feb 1, 2024, 16:45',
		unitPrice: 96,
		quantity: 1,
		status: 'on-hold',
		eta: 'Awaiting restock • Ships Feb 15',
		thumbnail: '/img/property/alvan-nee-brFsZ7qszSY-unsplash.jpg',
	},
];

const formatCurrency = (value: number) =>
	value.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
	});

const OrderPage: NextPage = () => {
	const router = useRouter();
	const subtotal = orderItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
	const deliveryFee = 24;
	const grandTotal = subtotal + deliveryFee;
	const totalOrders = orderItems.length;
	const activeOrders = orderItems.filter((item) => ['processing', 'shipped', 'on-hold'].includes(item.status)).length;
	const deliveredOrders = orderItems.filter((item) => item.status === 'delivered').length;
	const nextEta = orderItems.find((item) => item.status === 'processing' || item.status === 'shipped')?.eta ?? 'All caught up';

	return (
		<Stack className="order-page">
			<Stack className="container">
				<Stack className="order-hero">
					<Box className="order-hero__copy">
						<p className="eyebrow">ORDER</p>
						<Typography variant="h4" component="h1" className="order-heading">
							Latest orders
						</Typography>
						<p className="order-description">
							Live storefront snapshot with verified customer orders, carrier status, and running totals.
						</p>
						<Stack direction="row" spacing={1} className="order-hero__actions">
							<Button
								variant="contained"
								startIcon={<ShoppingCartCheckoutOutlinedIcon />}
								onClick={() => router.push('/property')}
							>
								Buy now
							</Button>
							<Button variant="text" startIcon={<RefreshIcon />} onClick={() => router.reload()}>
								Refresh
							</Button>
							<Button variant="text" startIcon={<LocalShippingOutlinedIcon />} onClick={() => router.push('/property')}>
								Continue shopping
							</Button>
						</Stack>
					</Box>

					<Stack className="order-hero__stats">
						<Stack className="stat-card">
							<span className="stat-label">Total</span>
							<span className="stat-value">{totalOrders}</span>
							<span className="stat-hint">{formatCurrency(grandTotal)} value</span>
						</Stack>
						<Stack className="stat-card">
							<span className="stat-label">Processing</span>
							<span className="stat-value">{activeOrders}</span>
							<span className="stat-hint">{nextEta}</span>
						</Stack>
						<Stack className="stat-card">
							<span className="stat-label">Finished</span>
							<span className="stat-value">{deliveredOrders}</span>
							<span className="stat-hint">Delivered & signed</span>
						</Stack>
					</Stack>
				</Stack>

				<Stack className="order-layout">
					<Box className="order-table">
						<Box className="table-head">
							<span>Product</span>
							<span>Unit</span>
							<span>Qty</span>
							<span>Total</span>
							<span>Status</span>
						</Box>
						<Divider />

						{orderItems.length ? (
							orderItems.map((item) => {
								const status = statusConfig[item.status];
								const lineTotal = item.unitPrice * item.quantity;
								return (
									<Box key={item.id} className="table-row">
										<Stack direction="row" spacing={1.5} alignItems="center" className="product-cell">
											<Box className="thumb">
												<img src={item.thumbnail} alt={item.product} />
											</Box>
											<Box className="product-meta">
												<span className="product-title">{item.product}</span>
												<span className="product-id">
													{item.id} • {item.sku}
												</span>
												<span className="product-date">Placed {item.placedOn}</span>
											</Box>
										</Stack>
										<span className="cell strong">{formatCurrency(item.unitPrice)}</span>
										<span className="cell">{item.quantity}</span>
										<span className="cell strong">{formatCurrency(lineTotal)}</span>
										<Stack className="cell" spacing={0.4}>
											<Button size="small" variant="contained" className={`status-chip status-chip--${status.className}`}>
												{status.label}
											</Button>
											<Typography sx={{ fontSize: 12, color: 'rgba(100,116,139,0.95)' }}>{status.description}</Typography>
											<Typography sx={{ fontSize: 12, color: 'rgba(100,116,139,0.95)' }}>{item.eta}</Typography>
										</Stack>
									</Box>
								);
							})
						) : (
							<Box className="table-empty">
								<img src="/img/icons/icoAlert.svg" alt="" />
								<span>Orders are not available right now.</span>
							</Box>
						)}
					</Box>

					<Stack className="order-sidebar">
						<Box className="summary-card">
							<Typography className="summary-title">Summary</Typography>
							<Stack className="summary-row">
								<span>Subtotal</span>
								<strong>{formatCurrency(subtotal)}</strong>
							</Stack>
							<Stack className="summary-row">
								<span>Delivery</span>
								<strong>{formatCurrency(deliveryFee)}</strong>
							</Stack>
							<Divider />
							<Stack className="summary-row total">
								<span>Grand total</span>
								<strong>{formatCurrency(grandTotal)}</strong>
							</Stack>
							<Button
								fullWidth
								variant="contained"
								color="primary"
								startIcon={<ShoppingCartCheckoutOutlinedIcon />}
								onClick={() => router.push('/property')}
							>
								Create order
							</Button>
							<Button fullWidth variant="text" onClick={() => router.push('/property')}>
								Continue shopping
							</Button>
						</Box>

						<Box className="contact-card">
							<Typography className="contact-title">Checkout information</Typography>
							<p className="contact-desc">
								Default shipping profile we use for marketplace test orders. Adjust before confirming checkout.
							</p>

							<label>Full name</label>
							<input type="text" placeholder="Full name" defaultValue="Amelia Chen" />

							<label>Phone</label>
							<input type="text" placeholder="Phone number" defaultValue="+1 (312) 555-0192" />

							<label>Address</label>
							<input type="text" placeholder="Delivery address" defaultValue="228 Berry St, Brooklyn, NY 11249" />

							<label>Notes</label>
							<textarea placeholder="Leave delivery notes (optional)" defaultValue="Leave with the doorman if we are out." />

							<Button variant="outlined" fullWidth disabled startIcon={<ShoppingCartCheckoutOutlinedIcon />}>
								Save info
							</Button>

							<span className="contact-hint">Personalized delivery preferences sync automatically once enabled.</span>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(OrderPage);
