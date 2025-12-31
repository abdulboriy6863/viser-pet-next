import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Box, Button, Chip, Divider, Pagination, Stack, Typography } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShoppingCartCheckoutOutlinedIcon from '@mui/icons-material/ShoppingCartCheckoutOutlined';
import EditLocationAltOutlinedIcon from '@mui/icons-material/EditLocationAltOutlined';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { GET_ORDERS } from '../../apollo/user/query';
import { UPDATE_MEMBER } from '../../apollo/user/mutation';
import { Order, OrderItem } from '../../libs/types/order/order';
import { Product } from '../../libs/types/property/property';
import { OrderStatus } from '../../libs/enums/order.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { updateStorage, updateUserInfo } from '../../libs/auth';

type OrderLine = {
	key: string;
	orderId: string;
	product?: Product;
	quantity: number;
	unitPrice: number;
	subtotal: number;
	status?: OrderStatus | string;
	createdAt?: Date;
};

const formatCurrency = (value: number = 0) =>
	`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value?: string | Date) => {
	if (!value) return '--';
	const date = new Date(value);
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const OrderPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [inquiry, setInquiry] = useState<{ page: number; limit: number }>({ page: 1, limit: 6 });
	const [contactInfo, setContactInfo] = useState({ fullName: '', phone: '', address: '', note: '' });
	const [contactSaved, setContactSaved] = useState<boolean>(false);
	const [savingContact, setSavingContact] = useState<boolean>(false);

	const { data: getOrdersData, loading: getOrdersLoading, refetch: refetchOrders } = useQuery(GET_ORDERS, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		variables: { inquiry },
	});
	const [updateMember] = useMutation(UPDATE_MEMBER);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const cached = localStorage.getItem('order-contact');
		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				setContactInfo(parsed);
				setContactSaved(true);
				return;
			} catch (err) {
				console.log('Failed to parse cached contact info', err);
			}
		}

		setContactInfo({
			fullName: user?.memberFullName ?? user?.memberNick ?? '',
			phone: user?.memberPhone ?? '',
			address: user?.memberAddress ?? '',
			note: '',
		});
	}, [user]);

	const orders: Order[] = useMemo(() => {
		const payload = getOrdersData?.getMyOrder;
		if (!payload) return [];
		if (Array.isArray(payload)) return payload as Order[];
		if (Array.isArray(payload?.list)) return payload.list as Order[];
		if ((payload as any)?.list) return (payload as any).list as Order[];
		return [payload as Order];
	}, [getOrdersData]);

	const orderLines: OrderLine[] = useMemo(() => {
		if (!orders?.length) return [];

		return orders.flatMap((order: Order) => {
			if (!order?.orderItems?.length) return [];

			return order.orderItems.map((item: OrderItem, idx: number) => {
				const product = order.productData?.find((p) => p._id === item.productId);
				const quantity = Number(item.itemQuantity ?? 1);
				const unitPrice = Number(item.itemPrice ?? product?.productPrice ?? 0);

				return {
					key: `${order._id}-${item._id ?? idx}`,
					orderId: order._id,
					product,
					quantity,
					unitPrice,
					subtotal: unitPrice * quantity,
					status: order.orderStatus,
					createdAt: order.createdAt,
				};
			});
		});
	}, [orders]);

	const totals = useMemo(() => {
		const subtotal = orderLines.reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0);
		const delivery = orders.reduce((sum, order) => sum + Number(order.orderDelivery ?? 0), 0);
		const totalByOrder = orders.reduce((sum, order) => sum + Number(order.orderTotal ?? 0), 0);

		return {
			subtotal,
			delivery,
			grandTotal: totalByOrder || subtotal + delivery,
		};
	}, [orderLines, orders]);

	const totalOrders = getOrdersData?.getMyOrder?.metaCounter?.[0]?.total ?? orders.length;
	const totalPages = Math.max(1, Math.ceil(totalOrders / inquiry.limit));

	const statusCounters = useMemo(() => {
		const initial: Record<string, number> = {};
		orders.forEach((order) => {
			const statusKey = order.orderStatus || OrderStatus.PROCESS;
			initial[statusKey] = (initial[statusKey] || 0) + 1;
		});
		return initial;
	}, [orders]);

	const saveContactInfo = async (silent: boolean = false) => {
		try {
			if (!contactInfo.fullName || !contactInfo.phone || !contactInfo.address) {
				await sweetMixinErrorAlert(Messages.error3);
				return false;
			}
			if (!user?._id) {
				await sweetMixinErrorAlert(Messages.error2);
				router.push('/account/join');
				return false;
			}

			setSavingContact(true);

			const result = await updateMember({
				variables: {
					input: {
						_id: user._id,
						memberFullName: contactInfo.fullName,
						memberPhone: contactInfo.phone,
						memberAddress: contactInfo.address,
					},
				},
			});

			const jwtToken = (result?.data as any)?.updateMember?.accessToken;
			if (jwtToken) {
				updateStorage({ jwtToken });
				updateUserInfo(jwtToken);
			}

			if (typeof window !== 'undefined') {
				localStorage.setItem('order-contact', JSON.stringify(contactInfo));
			}

			setContactSaved(true);
			if (!silent) {
				await sweetTopSmallSuccessAlert('Contact info saved for checkout', 1400);
			}
			return true;
		} catch (err: any) {
			console.log('ERROR saveContactInfo', err?.message);
			await sweetMixinErrorAlert(err?.message ?? Messages.error1);
			return false;
		} finally {
			setSavingContact(false);
		}
	};

	const handleCheckout = async () => {
		if (!orderLines.length) {
			await sweetMixinErrorAlert('Your cart is empty for checkout');
			return;
		}

		const success = await saveContactInfo(true);
		if (success) {
			await sweetTopSmallSuccessAlert('Checkout ready. You can proceed to payment.', 1600);
		}
	};

	const handlePageChange = async (_: ChangeEvent<unknown>, value: number) => {
		const nextInquiry = { ...inquiry, page: value };
		setInquiry(nextInquiry);
		await refetchOrders({ inquiry: nextInquiry });
	};

	const handleRefreshOrders = async () => {
		await refetchOrders({ inquiry });
	};

	const handleContinueShopping = () => {
		router.push('/property');
	};

	if (device === 'mobile') {
		return (
			<Stack className="order-page order-page--mobile">
				<Stack className="container">
					<Typography className="order-title">Your orders</Typography>
					<Typography className="order-subtitle">
						Products first land in your basket, then show up here after creation. Update your info once and reuse it.
					</Typography>

					<Stack className="order-stats">
						<Stack className="stat-card">
							<Typography className="stat-label">All</Typography>
							<Typography className="stat-value">{totalOrders}</Typography>
						</Stack>
						<Stack className="stat-card">
							<Typography className="stat-label">Processing</Typography>
							<Typography className="stat-value">{statusCounters[OrderStatus.PROCESS] ?? 0}</Typography>
						</Stack>
						<Stack className="stat-card">
							<Typography className="stat-label">Finished</Typography>
							<Typography className="stat-value">{statusCounters[OrderStatus.FINISH] ?? 0}</Typography>
						</Stack>
					</Stack>

					<Stack className="order-lines">
						{getOrdersLoading ? (
							<div className="empty-state">Loading orders...</div>
						) : orderLines.length === 0 ? (
							<div className="empty-state">No orders yet. Continue shopping to create one.</div>
						) : (
							orderLines.map((line) => (
								<Stack key={line.key} className="order-line">
									<Stack className="order-line__top">
										<Typography className="order-line__title">{line.product?.productName ?? 'Product'}</Typography>
										<Chip
											size="small"
											label={line.status ?? OrderStatus.PROCESS}
											className={`status-chip status-chip--${(line.status ?? OrderStatus.PROCESS).toString().toLowerCase()}`}
										/>
									</Stack>
									<Typography className="order-line__meta">
										Qty {line.quantity} · {formatCurrency(line.unitPrice)} · {formatDate(line.createdAt)}
									</Typography>
									<Typography className="order-line__price">{formatCurrency(line.subtotal)}</Typography>
								</Stack>
							))
						)}
					</Stack>

					<Stack className="contact-card">
						<Typography className="contact-title">Checkout details</Typography>
						<input
							placeholder="Full name"
							value={contactInfo.fullName}
							onChange={(e) => setContactInfo({ ...contactInfo, fullName: e.target.value })}
						/>
						<input
							placeholder="Phone number"
							value={contactInfo.phone}
							onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
						/>
						<input
							placeholder="Address"
							value={contactInfo.address}
							onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
						/>
						<textarea
							placeholder="Notes (optional)"
							value={contactInfo.note}
							onChange={(e) => setContactInfo({ ...contactInfo, note: e.target.value })}
						/>
						<Button variant="contained" onClick={() => saveContactInfo()} disabled={savingContact} startIcon={<EditLocationAltOutlinedIcon />}>
							{contactSaved ? 'Update info' : 'Save info once'}
						</Button>
						<Button variant="outlined" onClick={handleCheckout} startIcon={<ShoppingCartCheckoutOutlinedIcon />}>
							Proceed to checkout
						</Button>
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
						<p className="eyebrow">Orders</p>
						<Typography variant="h4" component="h1" className="order-heading">
							Your cart board
						</Typography>
						<p className="order-description">
							Products first go to your basket, then appear here after you create the order. Save your info once and reuse it for
							next purchases.
						</p>
						<Stack direction="row" spacing={1} className="order-hero__actions">
							<Button variant="contained" color="primary" onClick={handleContinueShopping} startIcon={<LocalShippingOutlinedIcon />}>
								Continue shopping
							</Button>
							<Button variant="text" onClick={handleRefreshOrders} startIcon={<RefreshIcon />}>
								Refresh
							</Button>
						</Stack>
					</Box>
					<Stack className="order-hero__stats">
						<Stack className="stat-card">
							<span className="stat-label">Total</span>
							<span className="stat-value">{totalOrders}</span>
							<span className="stat-hint">All orders</span>
						</Stack>
						<Stack className="stat-card">
							<span className="stat-label">Processing</span>
							<span className="stat-value">{statusCounters[OrderStatus.PROCESS] ?? 0}</span>
							<span className="stat-hint">Waiting for fulfillment</span>
						</Stack>
						<Stack className="stat-card">
							<span className="stat-label">Finished</span>
							<span className="stat-value">{statusCounters[OrderStatus.FINISH] ?? 0}</span>
							<span className="stat-hint">Already delivered</span>
						</Stack>
					</Stack>
				</Stack>

				<Stack className="order-layout">
					<Box className="order-table">
						<Box className="table-head">
							<span>Product</span>
							<span>Unit price</span>
							<span>Qty</span>
							<span>Subtotal</span>
							<span>Status</span>
						</Box>
						<Divider />

						{getOrdersLoading ? (
							<Box className="table-empty">Loading your orders...</Box>
						) : orderLines.length === 0 ? (
							<Box className="table-empty">
								<img src="/img/icons/icoAlert.svg" alt="" />
								<span>No orders yet. Add items to basket and create an order.</span>
							</Box>
						) : (
							orderLines.map((line) => (
								<Box className="table-row" key={line.key}>
									<Stack direction="row" spacing={2} alignItems="center" className="product-cell">
										<Box className="thumb">
											<img
												src={
													line.product?.productImages?.[0]
														? `${REACT_APP_API_URL}/${line.product.productImages[0]}`
														: '/img/property/default.jpg'
												}
												alt={line.product?.productName ?? 'product'}
											/>
										</Box>
										<Box className="product-meta">
											<Typography className="product-title">{line.product?.productName ?? 'Product'}</Typography>
											<span className="product-id">Order #{line.orderId?.slice(-6)}</span>
											<span className="product-date">{formatDate(line.createdAt)}</span>
										</Box>
									</Stack>
									<span className="cell">{formatCurrency(line.unitPrice)}</span>
									<span className="cell">{line.quantity}</span>
									<span className="cell strong">{formatCurrency(line.subtotal)}</span>
									<Chip
										label={line.status ?? OrderStatus.PROCESS}
										className={`status-chip status-chip--${(line.status ?? OrderStatus.PROCESS).toString().toLowerCase()}`}
										size="small"
										icon={
											line.status === OrderStatus.FINISH ? (
												<CheckCircleOutlineIcon />
											) : line.status === OrderStatus.PROCESS ? (
												<PendingActionsIcon />
											) : (
												<LocalShippingOutlinedIcon />
											)
										}
									/>
								</Box>
							))
						)}

						{orderLines.length > 0 && totalPages > 1 && (
							<Stack className="order-pagination">
								<Pagination
									page={inquiry.page}
									count={totalPages}
									onChange={handlePageChange}
									shape="rounded"
									color="primary"
								/>
							</Stack>
						)}
					</Box>

					<Stack className="order-sidebar">
						<Box className="summary-card">
							<Typography className="summary-title">Order summary</Typography>
							<Stack className="summary-row">
								<span>Subtotal</span>
								<strong>{formatCurrency(totals.subtotal)}</strong>
							</Stack>
							<Stack className="summary-row">
								<span>Delivery</span>
								<strong>{formatCurrency(totals.delivery)}</strong>
							</Stack>
							<Divider />
							<Stack className="summary-row total">
								<span>Grand total</span>
								<strong>{formatCurrency(totals.grandTotal)}</strong>
							</Stack>
							<Button
								fullWidth
								variant="contained"
								color="primary"
								onClick={handleCheckout}
								startIcon={<ShoppingCartCheckoutOutlinedIcon />}
							>
								Proceed to checkout
							</Button>
							<Button fullWidth variant="text" onClick={handleContinueShopping}>
								Continue shopping
							</Button>
						</Box>

						<Box className="contact-card">
							<Typography className="contact-title">Checkout information</Typography>
							<p className="contact-desc">
								Fill this once, we will remember it for your next purchases. You can update anytime.
							</p>
							<label>Full name</label>
							<input
								type="text"
								placeholder="Full name"
								value={contactInfo.fullName}
								onChange={(e) => setContactInfo({ ...contactInfo, fullName: e.target.value })}
							/>
							<label>Phone</label>
							<input
								type="text"
								placeholder="Phone number"
								value={contactInfo.phone}
								onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
							/>
							<label>Address</label>
							<input
								type="text"
								placeholder="Delivery address"
								value={contactInfo.address}
								onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
							/>
							<label>Notes</label>
							<textarea
								placeholder="Leave delivery notes (optional)"
								value={contactInfo.note}
								onChange={(e) => setContactInfo({ ...contactInfo, note: e.target.value })}
							/>
							<Button
								variant="outlined"
								fullWidth
								onClick={() => saveContactInfo()}
								disabled={savingContact}
								startIcon={<EditLocationAltOutlinedIcon />}
							>
								{contactSaved ? 'Update info' : 'Save info once'}
							</Button>
							<span className="contact-hint">
								{contactSaved ? 'Saved. We will reuse this info for future orders.' : 'Required once before paying.'}
							</span>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(OrderPage);
