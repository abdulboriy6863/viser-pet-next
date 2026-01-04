import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Box, Typography, Button, Divider, CircularProgress } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ShoppingCartCheckoutOutlinedIcon from '@mui/icons-material/ShoppingCartCheckoutOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';

import { REACT_APP_API_URL } from '../../libs/config';
import { formatterStr } from '../../libs/utils';
import { clearBasket, readBasket, removeItem, subscribeBasket, BasketStoredItem } from '../../libs/hooks/basket';

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'on-hold';

type OrderRow = {
	id: string;
	product: string;
	sku: string;
	placedOn: string;
	unitPrice: number;
	quantity: number;
	status: OrderStatus;
	eta: string;
	thumbnail: string;
	productId: string;
};

type Step = 'checkout' | 'creating' | 'updating' | 'success';

const statusConfig: Record<
	OrderStatus,
	{ label: string; className: 'process' | 'finish' | 'pause'; description: string }
> = {
	processing: { label: 'Processing', className: 'process', description: 'Payment confirmed • Packing now' },
	shipped: { label: 'Shipped', className: 'process', description: 'Handed to carrier • Tracking live' },
	delivered: { label: 'Delivered', className: 'finish', description: 'Signed by customer • Completed' },
	'on-hold': { label: 'On hold', className: 'pause', description: 'Awaiting restock • Customer notified' },
};

const formatCurrency = (value: number) => `$${formatterStr(Math.max(0, Number(value) || 0))}`;

const makeOrderId = () => {
	const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
	return `ORD-${Date.now().toString().slice(-5)}-${rand}`;
};

const makeSku = (productId: string) => `SKU-${productId.slice(-5).toUpperCase()}`;

// ====== simple validations ======
const onlyDigits = (v: string) => v.replace(/\D/g, '');
const maskCard = (v: string) => {
	const digits = onlyDigits(v).slice(0, 16);
	// 0000 0000 0000 0000
	return digits.replace(/(.{4})/g, '$1 ').trim();
};
const isValidCard = (v: string) => {
	const digits = onlyDigits(v);
	return digits.length === 16;
};

const OrderPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [rows, setRows] = useState<OrderRow[]>([]);
	const [step, setStep] = useState<Step>('checkout');
	const [error, setError] = useState<string>('');

	// checkout fields
	const [fullName, setFullName] = useState('');
	const [phone, setPhone] = useState('');
	const [address, setAddress] = useState('');
	const [note, setNote] = useState('');

	// payment fields
	const [cardNumber, setCardNumber] = useState('');
	const [exp, setExp] = useState(''); // MM/YY
	const [cvc, setCvc] = useState('');

	// created order snapshot
	const [createdOrderId, setCreatedOrderId] = useState<string>('');

	const deliveryFee = 24;

	const refreshFromBasket = useCallback(() => {
		if (!user?._id) {
			setRows([]);
			return;
		}

		const items: BasketStoredItem[] = readBasket(user._id);

		const next: OrderRow[] = items.map((it) => {
			const now = new Date();
			const placedOn = now.toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});

			const status: OrderStatus = 'processing';
			const eta = 'Preparing shipment • ETA 1–3 days';

			const thumb = it.productImage ? `${REACT_APP_API_URL}/${it.productImage}` : '/img/property/bigImage.png';

			return {
				id: makeOrderId(),
				product: it.productName,
				sku: makeSku(it.productId),
				placedOn,
				unitPrice: Number(it.unitPrice) || 0,
				quantity: Number(it.quantity) || 1,
				status,
				eta,
				thumbnail: thumb,
				productId: it.productId,
			};
		});

		setRows(next);
	}, [user?._id]);

	useEffect(() => {
		if (user?._id) {
			setFullName(user?.memberNick || '');
			setPhone(user?.memberPhone || '');
		}
	}, [user?._id]);

	useEffect(() => {
		refreshFromBasket();
	}, [refreshFromBasket]);

	useEffect(() => {
		const unsub = subscribeBasket(user?._id, refreshFromBasket);
		return () => unsub();
	}, [user?._id, refreshFromBasket]);

	const subtotal = useMemo(() => rows.reduce((acc, r) => acc + r.unitPrice * r.quantity, 0), [rows]);
	const grandTotal = subtotal + (rows.length ? deliveryFee : 0);

	const handleRemoveLine = (productId: string) => {
		if (!user?._id) return;
		removeItem(productId, user._id);
		refreshFromBasket();
	};

	const canSubmit = useMemo(() => {
		if (!rows.length) return false;
		if (!fullName.trim()) return false;
		if (!phone.trim()) return false;
		if (!address.trim()) return false;

		// payment required
		if (!isValidCard(cardNumber)) return false;
		if (!exp.trim()) return false;
		if (onlyDigits(cvc).length < 3) return false;

		return true;
	}, [rows.length, fullName, phone, address, cardNumber, exp, cvc]);

	/**
	 * ✅ This is the correct flow:
	 * 1) Validate checkout + payment fields
	 * 2) CREATE_ORDER (backend) -> returns orderId
	 * 3) UPDATE_ORDER (backend) -> mark paid / attach payment snapshot
	 * 4) Success UI
	 * 5) Clear basket AFTER success
	 */
	const handleCreateOrder = async () => {
		setError('');

		if (!user?._id) {
			await router.push('/account/join');
			return;
		}

		if (!rows.length) {
			setError('Your basket is empty.');
			return;
		}

		if (!canSubmit) {
			setError('Please fill all required fields and a valid card number.');
			return;
		}

		try {
			// ============ STEP 1: CREATE ============
			setStep('creating');

			// ✅ place for real backend CREATE_ORDER mutation
			// const { data } = await createOrder({ variables: { input: ... } })
			// const orderId = data.createOrder._id

			// snapshot fallback (backend yo‘q bo‘lsa)
			const orderId = makeOrderId();
			setCreatedOrderId(orderId);

			// ============ STEP 2: UPDATE ============
			setStep('updating');

			// ✅ place for real backend UPDATE_ORDER mutation
			// await updateOrder({ variables: { input: { orderId, status: 'PROCESSING', payment: { last4, ... } } } })

			// simulate network delay (backend yo‘q bo‘lsa ham UX yaxshi)
			await new Promise((r) => setTimeout(r, 400));

			// ============ STEP 3: SUCCESS ============
			setStep('success');

			// ✅ Clear basket ONLY after success
			clearBasket(user._id);
		} catch (e: any) {
			setError(e?.message || 'Failed to create order.');
			setStep('checkout');
		}
	};

	const handleRefresh = () => refreshFromBasket();

	// login bo‘lmasa
	if (!user?._id) {
		return (
			<Stack className="order-page">
				<Stack className="container">
					<Stack className="order-hero">
						<Box className="order-hero__copy">
							<p className="eyebrow">ORDER</p>
							<Typography variant="h4" component="h1" className="order-heading">
								Checkout
							</Typography>
							<p className="order-description">Please login to view your basket and create an order.</p>
							<Stack direction="row" spacing={1} className="order-hero__actions">
								<Button variant="contained" onClick={() => router.push('/account/join')}>
									Login / Register
								</Button>
								<Button
									variant="text"
									startIcon={<LocalShippingOutlinedIcon />}
									onClick={() => router.push('/property')}
								>
									Continue shopping
								</Button>
							</Stack>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	// SUCCESS UI
	if (step === 'success') {
		return (
			<Stack className="order-page">
				<Stack className="container">
					<Box className="summary-card" sx={{ maxWidth: 720, mx: 'auto' }}>
						<Stack direction="row" spacing={1.2} alignItems="center">
							<CheckCircleOutlineIcon color="success" />
							<Typography className="summary-title" sx={{ fontSize: 22 }}>
								Order created successfully
							</Typography>
						</Stack>

						<Divider sx={{ my: 2 }} />

						<Stack className="summary-row">
							<span>Order ID</span>
							<strong>{createdOrderId}</strong>
						</Stack>
						<Stack className="summary-row">
							<span>Charged</span>
							<strong>{formatCurrency(grandTotal)}</strong>
						</Stack>
						<Stack className="summary-row">
							<span>Delivery</span>
							<strong>{address}</strong>
						</Stack>

						<Divider sx={{ my: 2 }} />

						<Button variant="contained" onClick={() => router.push('/property')}>
							Continue shopping
						</Button>
					</Box>
				</Stack>
			</Stack>
		);
	}

	const busy = step === 'creating' || step === 'updating';

	return (
		<Stack className="order-page">
			<Stack className="container">
				<Stack className="order-hero">
					<Box className="order-hero__copy">
						<p className="eyebrow">ORDER</p>
						<Typography variant="h4" component="h1" className="order-heading">
							Checkout
						</Typography>
						<p className="order-description">
							Create order works in 2 steps: <b>Create</b> → <b>Update (payment)</b>. Basket clears only after success.
						</p>

						<Stack direction="row" spacing={1} className="order-hero__actions">
							<Button
								variant="contained"
								startIcon={<ShoppingCartCheckoutOutlinedIcon />}
								onClick={handleCreateOrder}
								disabled={busy || rows.length === 0}
							>
								{step === 'creating' ? 'Creating...' : step === 'updating' ? 'Updating...' : 'Create order'}
							</Button>

							<Button variant="text" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={busy}>
								Refresh
							</Button>

							<Button
								variant="text"
								startIcon={<LocalShippingOutlinedIcon />}
								onClick={() => router.push('/property')}
								disabled={busy}
							>
								Continue shopping
							</Button>
						</Stack>

						{!!error && <Typography sx={{ mt: 1, color: '#ef4444', fontWeight: 700 }}>{error}</Typography>}
					</Box>

					<Stack className="order-hero__stats">
						<Stack className="stat-card">
							<span className="stat-label">Items</span>
							<span className="stat-value">{rows.length}</span>
							<span className="stat-hint">{formatCurrency(grandTotal)} value</span>
						</Stack>
						<Stack className="stat-card">
							<span className="stat-label">Step</span>
							<span className="stat-value">
								{step === 'checkout' ? 'Checkout' : step === 'creating' ? 'Create' : 'Update'}
							</span>
							<span className="stat-hint">{busy ? 'Please wait…' : 'Ready'}</span>
						</Stack>
						<Stack className="stat-card">
							<span className="stat-label">Delivery</span>
							<span className="stat-value">{rows.length ? formatCurrency(deliveryFee) : '$0'}</span>
							<span className="stat-hint">Flat fee</span>
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

						{rows.length ? (
							rows.map((item) => {
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

												<Button
													variant="text"
													size="small"
													sx={{ mt: 0.5, p: 0, minWidth: 'auto', fontWeight: 800 }}
													onClick={() => handleRemoveLine(item.productId)}
													disabled={busy}
												>
													Remove
												</Button>
											</Box>
										</Stack>

										<span className="cell strong">{formatCurrency(item.unitPrice)}</span>
										<span className="cell">{item.quantity}</span>
										<span className="cell strong">{formatCurrency(lineTotal)}</span>

										<Stack className="cell" spacing={0.4}>
											<Button
												size="small"
												variant="contained"
												className={`status-chip status-chip--${status.className}`}
											>
												{status.label}
											</Button>
											<Typography sx={{ fontSize: 12, color: 'rgba(100,116,139,0.95)' }}>
												{status.description}
											</Typography>
											<Typography sx={{ fontSize: 12, color: 'rgba(100,116,139,0.95)' }}>{item.eta}</Typography>
										</Stack>
									</Box>
								);
							})
						) : (
							<Box className="table-empty">
								<img src="/img/icons/icoAlert.svg" alt="" />
								<span>Your basket is empty.</span>
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
								<strong>{formatCurrency(rows.length ? deliveryFee : 0)}</strong>
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
								onClick={handleCreateOrder}
								disabled={busy || !canSubmit}
							>
								{busy ? 'Processing...' : 'Pay & Create order'}
							</Button>

							<Button fullWidth variant="text" onClick={() => router.push('/property')} disabled={busy}>
								Continue shopping
							</Button>

							{busy && (
								<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
									<CircularProgress size={18} />
									<Typography sx={{ fontSize: 13, color: 'rgba(100,116,139,0.95)' }}>
										{step === 'creating' ? 'Creating order…' : 'Updating payment…'}
									</Typography>
								</Stack>
							)}
						</Box>

						<Box className="contact-card">
							<Typography className="contact-title">Checkout information</Typography>
							<p className="contact-desc">Fill required fields to enable payment and order creation.</p>

							<label>Full name *</label>
							<input
								type="text"
								placeholder="Full name"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								disabled={busy}
							/>

							<label>Phone *</label>
							<input
								type="text"
								placeholder="Phone number"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								disabled={busy}
							/>

							<label>Address *</label>
							<input
								type="text"
								placeholder="Delivery address"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								disabled={busy}
							/>

							<label>Notes</label>
							<textarea
								placeholder="Leave delivery notes (optional)"
								value={note}
								onChange={(e) => setNote(e.target.value)}
								disabled={busy}
							/>

							<Divider sx={{ my: 2 }} />

							<Typography sx={{ fontWeight: 900, mb: 1 }}>Payment</Typography>

							<label>Card number *</label>
							<input
								type="text"
								placeholder="0000 0000 0000 0000"
								value={cardNumber}
								onChange={(e) => setCardNumber(maskCard(e.target.value))}
								disabled={busy}
							/>
							{cardNumber && !isValidCard(cardNumber) && (
								<Typography sx={{ mt: 0.5, fontSize: 12, color: '#ef4444', fontWeight: 700 }}>
									Card number must be 16 digits.
								</Typography>
							)}

							<label>Expiry (MM/YY) *</label>
							<input
								type="text"
								placeholder="08/28"
								value={exp}
								onChange={(e) => setExp(e.target.value.slice(0, 5))}
								disabled={busy}
							/>

							<label>CVC *</label>
							<input
								type="text"
								placeholder="123"
								value={cvc}
								onChange={(e) => setCvc(onlyDigits(e.target.value).slice(0, 4))}
								disabled={busy}
							/>

							<Button
								variant="outlined"
								fullWidth
								startIcon={<ShoppingCartCheckoutOutlinedIcon />}
								onClick={handleCreateOrder}
								disabled={busy || !canSubmit}
								sx={{ mt: 1.5 }}
							>
								{busy ? 'Processing...' : 'Pay & Create order'}
							</Button>

							<span className="contact-hint">
								* Required. This is a UI snapshot payment (no real charge). Backend mutations can be plugged in easily.
							</span>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(OrderPage);
