import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Box, Typography, Button, Divider } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ShoppingCartCheckoutOutlinedIcon from '@mui/icons-material/ShoppingCartCheckoutOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';

import { REACT_APP_API_URL } from '../../libs/config';
import { formatterStr } from '../../libs/utils';
import {
	basketTotals,
	clearBasket,
	readBasket,
	removeItem,
	subscribeBasket,
	BasketStoredItem,
} from '../../libs/hooks/basket';

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

	thumbnail: string; // absolute url
	productId: string; // basket remove uchun
};

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
	// front snapshot uchun “unique” order id (backend bo‘lmaganda)
	const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
	return `ORD-${Date.now().toString().slice(-5)}-${rand}`;
};

const makeSku = (productId: string) => `SKU-${productId.slice(-5).toUpperCase()}`;

const OrderPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [rows, setRows] = useState<OrderRow[]>([]);
	const [creating, setCreating] = useState(false);

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
		refreshFromBasket();
	}, [refreshFromBasket]);

	useEffect(() => {
		const unsub = subscribeBasket(user?._id, refreshFromBasket);
		return () => unsub();
	}, [user?._id, refreshFromBasket]);

	const subtotal = useMemo(() => rows.reduce((acc, r) => acc + r.unitPrice * r.quantity, 0), [rows]);
	const grandTotal = subtotal + (rows.length ? deliveryFee : 0);

	const totalOrders = rows.length;
	const activeOrders = rows.filter((x) => ['processing', 'shipped', 'on-hold'].includes(x.status)).length;
	const deliveredOrders = rows.filter((x) => x.status === 'delivered').length;

	const nextEta = rows.find((x) => x.status === 'processing' || x.status === 'shipped')?.eta ?? 'All caught up';

	const handleRemoveLine = (productId: string) => {
		if (!user?._id) return;
		removeItem(productId, user._id);
		// event orqali ham refresh bo‘ladi, lekin tezkor:
		refreshFromBasket();
	};

	/**
	 * ✅ Buy now / Create order:
	 * - backend yo‘q bo‘lsa ham, “order created” snapshot qilish
	 * - va basketni darrov tozalash (qayta paydo bo‘lmasin)
	 */
	const handleCreateOrder = async () => {
		try {
			if (!user?._id) {
				await router.push('/account/join');
				return;
			}
			if (!rows.length) {
				await router.push('/property');
				return;
			}

			setCreating(true);

			// ⬇️ Agar keyin GraphQL CREATE_ORDER qo‘shsang, shu yerga qo‘yasan
			// await createOrderMutation({ variables: ... })

			// ✅ muvaffaqiyatli bo‘ldi deb qabul qilamiz:
			clearBasket(user._id);

			// UI snapshot uchun: “delivered” emas, “processing” ko‘rinishda turadi
			setRows([]); // basket bo‘sh, order “tugadi” snapshot
			// xohlasang “Thank you” pagega yo‘naltir:
			// await router.push('/order/success');
		} finally {
			setCreating(false);
		}
	};

	const handleRefresh = () => refreshFromBasket();

	// user login bo‘lmasa (talabing bo‘yicha) order/basket ko‘rsatmaymiz
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
							This page is connected to your basket. Create order will clear basket items immediately after success.
						</p>

						<Stack direction="row" spacing={1} className="order-hero__actions">
							<Button
								variant="contained"
								startIcon={<ShoppingCartCheckoutOutlinedIcon />}
								onClick={handleCreateOrder}
								disabled={creating || rows.length === 0}
							>
								{creating ? 'Creating...' : 'Create order'}
							</Button>

							<Button variant="text" startIcon={<RefreshIcon />} onClick={handleRefresh}>
								Refresh
							</Button>

							<Button variant="text" startIcon={<LocalShippingOutlinedIcon />} onClick={() => router.push('/property')}>
								Continue shopping
							</Button>
						</Stack>
					</Box>

					<Stack className="order-hero__stats">
						<Stack className="stat-card">
							<span className="stat-label">Items</span>
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

												{/* ✅ remove from basket */}
												<Button
													variant="text"
													size="small"
													sx={{ mt: 0.5, p: 0, minWidth: 'auto', fontWeight: 800 }}
													onClick={() => handleRemoveLine(item.productId)}
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
								disabled={creating || rows.length === 0}
							>
								{creating ? 'Creating...' : 'Create order'}
							</Button>

							<Button fullWidth variant="text" onClick={() => router.push('/property')}>
								Continue shopping
							</Button>
						</Box>

						{/* Checkout info UI qoldirdim, faqat defaultlarni user data bilan boyitdim */}
						<Box className="contact-card">
							<Typography className="contact-title">Checkout information</Typography>
							<p className="contact-desc">
								Saved profile will auto-fill once enabled. For now we use a placeholder snapshot.
							</p>

							<label>Full name</label>
							<input type="text" placeholder="Full name" defaultValue={user?.memberNick || ''} />

							<label>Phone</label>
							<input type="text" placeholder="Phone number" defaultValue={user?.memberPhone || ''} />

							<label>Address</label>
							<input type="text" placeholder="Delivery address" defaultValue="(Add address in profile)" />

							<label>Notes</label>
							<textarea
								placeholder="Leave delivery notes (optional)"
								defaultValue="Leave at reception if not available."
							/>

							<Button variant="outlined" fullWidth disabled startIcon={<ShoppingCartCheckoutOutlinedIcon />}>
								Save info
							</Button>

							<span className="contact-hint">Profile syncing is disabled in this snapshot mode.</span>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(OrderPage);
