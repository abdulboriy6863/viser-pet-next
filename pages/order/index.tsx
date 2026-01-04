import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Box, Typography, Button, Divider } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ShoppingCartCheckoutOutlinedIcon from '@mui/icons-material/ShoppingCartCheckoutOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

const OrderPage: NextPage = () => {
	const router = useRouter();

	return (
		<Stack className="order-page">
			<Stack className="container">
				<Stack className="order-hero">
					<Box className="order-hero__copy">
						<p className="eyebrow">ORDER</p>
						<Typography variant="h4" component="h1" className="order-heading">
							Order page
						</Typography>
						<p className="order-description">Order functionality is currently disabled.</p>
						<Stack direction="row" spacing={1} className="order-hero__actions">
							<Button
								variant="contained"
								startIcon={<ShoppingCartCheckoutOutlinedIcon />}
								onClick={() => router.push('/order')}
							>
								Buy now
							</Button>
							<Button variant="text" startIcon={<RefreshIcon />}>
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
							<span className="stat-value">0</span>
							<span className="stat-hint">Orders unavailable</span>
						</Stack>
						<Stack className="stat-card">
							<span className="stat-label">Processing</span>
							<span className="stat-value">0</span>
							<span className="stat-hint">Waiting</span>
						</Stack>
						<Stack className="stat-card">
							<span className="stat-label">Finished</span>
							<span className="stat-value">0</span>
							<span className="stat-hint">Paid</span>
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

						<Box className="table-empty">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<span>Orders are not available right now.</span>
						</Box>
					</Box>

					<Stack className="order-sidebar">
						<Box className="summary-card">
							<Typography className="summary-title">Summary</Typography>
							<Stack className="summary-row">
								<span>Subtotal</span>
								<strong>$0.00</strong>
							</Stack>
							<Stack className="summary-row">
								<span>Delivery</span>
								<strong>$0.00</strong>
							</Stack>
							<Divider />
							<Stack className="summary-row total">
								<span>Grand total</span>
								<strong>$0.00</strong>
							</Stack>
							<Button fullWidth variant="contained" color="primary" startIcon={<ShoppingCartCheckoutOutlinedIcon />}>
								Create order
							</Button>
							<Button fullWidth variant="text" onClick={() => router.push('/property')}>
								Continue shopping
							</Button>
						</Box>

						<Box className="contact-card">
							<Typography className="contact-title">Checkout information</Typography>
							<p className="contact-desc">Order form is currently disabled.</p>

							<label>Full name</label>
							<input type="text" placeholder="Full name" value="" readOnly />

							<label>Phone</label>
							<input type="text" placeholder="Phone number" value="" readOnly />

							<label>Address</label>
							<input type="text" placeholder="Delivery address" value="" readOnly />

							<label>Notes</label>
							<textarea placeholder="Leave delivery notes (optional)" value="" readOnly />

							<Button variant="outlined" fullWidth disabled startIcon={<ShoppingCartCheckoutOutlinedIcon />}>
								Save info
							</Button>

							<span className="contact-hint">Order flow disabled.</span>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(OrderPage);
