import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Box, Button, Chip, Divider, Pagination, Stack, Typography, Backdrop, CircularProgress } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShoppingCartCheckoutOutlinedIcon from '@mui/icons-material/ShoppingCartCheckoutOutlined';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

import { userVar } from '../../apollo/store';
import { GET_ORDERS } from '../../apollo/user/query';
import { CREATE_ORDER, UPDATE_ORDER } from '../../apollo/user/mutation'; // ✅ sizda bor dedingiz

import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

import { Order, Orders } from '../../libs/types/order/order';
import { CreateOrderInput } from '../../libs/types/order/order.input';
import { OrderUpdate } from '../../libs/types/order/order.update';
import { Product } from '../../libs/types/property/property';
import { OrderStatus } from '../../libs/enums/order.enum';

import { basketTotals, calcDiscountedPrice, readBasket, removeFromBasket } from '../../libs/utils/basket';

type BasketLine = {
	productId: string;
	quantity: number;
	product?: Product;
};

type ContactInfo = {
	fullName: string;
	phone: string;
	address: string;
	note: string;
	cardNumber: string; // fake payment
};

type OrderLine = {
	key: string;
	orderId: string;
	product?: Product;
	quantity: number;
	unitPrice: number;
	subtotal: number;
	status: OrderStatus | string;
	createdAt?: string | Date;
};

const CONTACT_KEY = 'order-contact-v2';
const BUY_NOW_FLAG_KEY = 'order-buy-now'; // optional: refreshdan keyin ham GET_ORDERS skip bo‘lib qolmasin

const formatCurrency = (value: number = 0) =>
	`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value?: string | Date) => {
	if (!value) return '--';
	const date = new Date(value);
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const OrderPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** Basket */
	const [basket, setBasket] = useState<BasketLine[]>([]);
	const basketInfo = useMemo(() => basketTotals(), [basket]); // util localStorage o‘qiydi, biz state sync qilamiz

	/** BuyNow gate: GET_ORDERS faqat BuyNow bo‘lgandan keyin */
	const [buyNowTriggered, setBuyNowTriggered] = useState<boolean>(false);

	/** pagination */
	const [inquiry, setInquiry] = useState<{ page: number; limit: number; search: Record<string, any> }>({
		page: 1,
		limit: 6,
		search: {},
	});

	/** UI */
	const [busy, setBusy] = useState(false);

	/** contact + payment */
	const [contact, setContact] = useState<ContactInfo>({
		fullName: '',
		phone: '',
		address: '',
		note: '',
		cardNumber: '',
	});

	/** mutations */
	const [createOrder] = useMutation(CREATE_ORDER);
	const [updateOrder] = useMutation(UPDATE_ORDER);

	/**
	 * ✅ GET_ORDERS — BuyNow bo‘lmaguncha SKIP
	 * (real data: createOrderdan keyin refetch ishlaydi)
	 */
	const {
		data: ordersData,
		loading: ordersLoading,
		refetch: refetchOrders,
	} = useQuery(GET_ORDERS, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		skip: !buyNowTriggered,
		variables: { inquiry },
	});

	/** init: basket sync */
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const sync = () => {
			const raw = readBasket() as any[];
			const normalized: BasketLine[] = (raw ?? []).map((x: any) => ({
				productId: x.productId,
				quantity: Number(x.quantity ?? 1),
				product: x.product,
			}));
			setBasket(normalized);
		};

		sync();
		window.addEventListener('basket-updated', sync as EventListener);

		return () => window.removeEventListener('basket-updated', sync as EventListener);
	}, []);

	/** init: contact autofill (user + localStorage) */
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const cached = localStorage.getItem(CONTACT_KEY);
		if (cached) {
			try {
				const parsed = JSON.parse(cached) as Partial<ContactInfo>;
				setContact((prev) => ({
					...prev,
					fullName: parsed.fullName ?? prev.fullName,
					phone: parsed.phone ?? prev.phone,
					address: parsed.address ?? prev.address,
					note: parsed.note ?? prev.note,
					cardNumber: parsed.cardNumber ?? prev.cardNumber,
				}));
				return;
			} catch {}
		}

		setContact((prev) => ({
			...prev,
			fullName: user?.memberFullName ?? user?.memberNick ?? '',
			phone: user?.memberPhone ?? '',
			address: user?.memberAddress ?? '',
		}));
	}, [user]);

	/** init: agar user refresh qilsa ham buyNow flagni saqlab turamiz (optional) */
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const flag = localStorage.getItem(BUY_NOW_FLAG_KEY);
		if (flag === '1') setBuyNowTriggered(true);
	}, []);

	const orders: Order[] = useMemo(() => {
		const payload: Orders | Order[] | Order | undefined = ordersData?.getMyOrder;
		if (!payload) return [];
		if (Array.isArray(payload)) return payload as Order[];
		if ((payload as Orders).list) return (payload as Orders).list;
		return [payload as Order];
	}, [ordersData]);

	const orderLines: OrderLine[] = useMemo(() => {
		if (!orders.length) return [];
		return orders.flatMap((order) => {
			const items = order.orderItems ?? [];
			const products = order.productData ?? [];
			return items.map((it, idx) => {
				const product = products.find((p) => p._id === it.productId);
				const quantity = Number(it.itemQuantity ?? 1);
				const unitPrice = Number(it.itemPrice ?? calcDiscountedPrice(product) ?? 0);
				return {
					key: `${order._id}-${it._id ?? idx}`,
					orderId: order._id,
					product,
					quantity,
					unitPrice,
					subtotal: unitPrice * quantity,
					status: order.orderStatus ?? OrderStatus.PROCESS,
					createdAt: order.createdAt,
				};
			});
		});
	}, [orders]);

	const statusCounters = useMemo(() => {
		const acc: Record<string, number> = {};
		orders.forEach((o) => {
			const k = o.orderStatus ?? OrderStatus.PROCESS;
			acc[k] = (acc[k] || 0) + 1;
		});
		return acc;
	}, [orders]);

	const totalOrders = ordersData?.getMyOrder?.metaCounter?.[0]?.total ?? orders.length;
	const totalPages = Math.max(1, Math.ceil(totalOrders / inquiry.limit));

	/** validation: contact must be filled before create order */
	const validateContact = async () => {
		if (!user?._id) {
			await sweetMixinErrorAlert(Messages.error2);
			router.push('/account/join');
			return false;
		}
		if (!contact.fullName || !contact.phone || !contact.address) {
			await sweetMixinErrorAlert(Messages.error3); // "fill required fields" sizda bor
			return false;
		}
		return true;
	};

	const persistContact = () => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(CONTACT_KEY, JSON.stringify(contact));
	};

	/** Buy Now: basket -> CREATE_ORDER -> GET_ORDERS -> UPDATE_ORDER (fake pay) */
	const handleBuyNow = async () => {
		try {
			if (!basket.length) {
				await sweetMixinErrorAlert('Basket is empty');
				return;
			}
			const ok = await validateContact();
			if (!ok) return;

			setBusy(true);

			// 1) CREATE_ORDER input (server expects items array)
			const input: CreateOrderInput = {
				memberId: user!._id,
				orderStatus: OrderStatus.PROCESS,
				items: basket.map((b) => ({
					productId: b.productId,
					memberId: user!._id,
					itemQuantity: Number(b.quantity ?? 1),
					itemPrice: Number(calcDiscountedPrice(b.product) ?? b.product?.productPrice ?? 0),
				})),
			};

			const created = await createOrder({ variables: { input } });
			const createdOrder: Order | undefined = (created?.data as any)?.createOrder;
			const createdOrderId = createdOrder?._id;

			if (!createdOrderId) {
				await sweetMixinErrorAlert(Messages.error1);
				return;
			}

			// cache contact for next time
			persistContact();

			// 2) BuyNow gate ON => GET_ORDERS endi ishlaydi
			setBuyNowTriggered(true);
			if (typeof window !== 'undefined') localStorage.setItem(BUY_NOW_FLAG_KEY, '1');

			// 3) refetch orders (show real created order)
			await refetchOrders({ inquiry: { ...inquiry, search: { ...(inquiry.search ?? {}), orderId: createdOrderId } } });

			// 4) fake payment -> UPDATE_ORDER
			// Card number bo‘lsa FINISH, bo‘lmasa PROCESS (ixtiyoriy)
			const nextStatus = contact.cardNumber?.trim() ? OrderStatus.FINISH : OrderStatus.PROCESS;

			const updatePayload: OrderUpdate = {
				_id: createdOrderId,
				orderStatus: nextStatus,
				// total/delivery server computed bo‘lsa berish shart emas,
				// lekin sizda ixtiyoriy bo‘lsin deb basket subtotal beramiz:
				orderTotal: Number(basketInfo.subtotal ?? 0),
				orderDelivery: 0,
			};

			await updateOrder({ variables: { input: updatePayload } });
			await refetchOrders({ inquiry: { ...inquiry, search: { ...(inquiry.search ?? {}), orderId: createdOrderId } } });

			// 5) basket tozalash (siz xohlasangiz)
			// Bu real shop emas, lekin UX yaxshi bo‘ladi
			basket.forEach((b) => removeFromBasket(b.productId));
			setBasket([]);

			await sweetTopSmallSuccessAlert('Order created successfully ✅', 1400);
		} catch (err: any) {
			console.log('BUY_NOW_ERROR', err?.message);
			await sweetMixinErrorAlert(err?.message ?? Messages.error1);
		} finally {
			setBusy(false);
		}
	};

	const handlePageChange = async (_: ChangeEvent<unknown>, value: number) => {
		const next = { ...inquiry, page: value };
		setInquiry(next);
		if (buyNowTriggered) await refetchOrders({ inquiry: next });
	};

	const handleRefresh = async () => {
		if (!buyNowTriggered) return;
		await refetchOrders({ inquiry });
	};

	const handleRemoveBasketItem = (productId: string) => {
		removeFromBasket(productId);
		const raw = readBasket() as any[];
		const normalized: BasketLine[] = (raw ?? []).map((x: any) => ({
			productId: x.productId,
			quantity: Number(x.quantity ?? 1),
			product: x.product,
		}));
		setBasket(normalized);
	};

	const totals = useMemo(() => {
		// order bo‘lsa orderTotal ko‘rsatamiz, bo‘lmasa basket subtotal
		const orderTotalSum = orders.reduce((sum, o) => sum + Number(o.orderTotal ?? 0), 0);
		if (orderLines.length) return { subtotal: orderTotalSum, delivery: 0, grandTotal: orderTotalSum };
		return { subtotal: Number(basketInfo.subtotal ?? 0), delivery: 0, grandTotal: Number(basketInfo.subtotal ?? 0) };
	}, [orders, orderLines, basketInfo]);

	/** MOBILE: siz hozircha pc UIga yaqin qolamiz, lekin classNames alohida */
	const isMobile = device === 'mobile';

	return (
		<Stack className={`order-page ${isMobile ? 'order-page--mobile' : ''}`}>
			<Backdrop open={busy} sx={{ zIndex: 1301 }}>
				<CircularProgress />
			</Backdrop>

			<Stack className="container">
				{/* HERO */}
				<Stack className="order-hero">
					<Box className="order-hero__copy">
						<p className="eyebrow">ORDER</p>
						<Typography className="order-heading">Order page</Typography>
						<p className="order-description">
							Bu real shopping emas. Card number kiritilsa ham “payment” o‘tadi. Buy now bosilgandan keyin orderlar
							chiqadi.
						</p>

						<Stack direction="row" spacing={1} className="order-hero__actions">
							<Button variant="contained" onClick={handleBuyNow} startIcon={<ShoppingCartCheckoutOutlinedIcon />}>
								Buy now
							</Button>
							<Button variant="text" onClick={handleRefresh} startIcon={<RefreshIcon />} disabled={!buyNowTriggered}>
								Refresh
							</Button>
							<Button variant="text" onClick={() => router.push('/property')} startIcon={<LocalShippingOutlinedIcon />}>
								Continue shopping
							</Button>
						</Stack>
					</Box>

					<Stack className="order-hero__stats">
						<Stack className="stat-card">
							<span className="stat-label">Total</span>
							<span className="stat-value">{buyNowTriggered ? totalOrders : 0}</span>
							<span className="stat-hint">{buyNowTriggered ? 'Orders fetched' : 'Buy now required'}</span>
						</Stack>
						<Stack className="stat-card">
							<span className="stat-label">Processing</span>
							<span className="stat-value">{buyNowTriggered ? statusCounters[OrderStatus.PROCESS] ?? 0 : 0}</span>
							<span className="stat-hint">Waiting</span>
						</Stack>
						<Stack className="stat-card">
							<span className="stat-label">Finished</span>
							<span className="stat-value">{buyNowTriggered ? statusCounters[OrderStatus.FINISH] ?? 0 : 0}</span>
							<span className="stat-hint">Paid</span>
						</Stack>
					</Stack>
				</Stack>

				{/* LAYOUT */}
				<Stack className="order-layout">
					{/* LEFT */}
					<Box className="order-table">
						<Box className="table-head">
							<span>Product</span>
							<span>Unit</span>
							<span>Qty</span>
							<span>Total</span>
							<span>Status</span>
						</Box>
						<Divider />

						{/* BEFORE BUY NOW => show basket */}
						{!buyNowTriggered ? (
							basket.length ? (
								<>
									<Box className="table-empty table-empty--info">
										<span>Buy now bosilmaguncha orderlar yuklanmaydi. Hozir basketdagi productlar ko‘rinmoqda.</span>
									</Box>

									{basket.map((b) => {
										const unit = Number(calcDiscountedPrice(b.product) ?? b.product?.productPrice ?? 0);
										return (
											<Box className="table-row" key={`basket-${b.productId}`}>
												<Stack direction="row" spacing={2} alignItems="center" className="product-cell">
													<Box className="thumb">
														<img
															src={
																b.product?.productImages?.[0]
																	? `${REACT_APP_API_URL}/${b.product.productImages[0]}`
																	: '/img/property/default.jpg'
															}
															alt={b.product?.productName ?? 'product'}
														/>
													</Box>
													<Box className="product-meta">
														<Typography className="product-title">{b.product?.productName ?? 'Product'}</Typography>
														<span className="product-id">Basket item</span>
													</Box>
												</Stack>

												<span className="cell">{formatCurrency(unit)}</span>
												<span className="cell">{b.quantity}</span>
												<span className="cell strong">{formatCurrency(unit * Number(b.quantity ?? 1))}</span>

												<Button
													variant="text"
													size="small"
													className="danger-btn"
													startIcon={<DeleteOutlineRoundedIcon />}
													onClick={() => handleRemoveBasketItem(b.productId)}
												>
													Delete
												</Button>
											</Box>
										);
									})}
								</>
							) : (
								<Box className="table-empty">
									<img src="/img/icons/icoAlert.svg" alt="" />
									<span>Basket bo‘sh. Property sahifasidan product qo‘shing.</span>
								</Box>
							)
						) : ordersLoading ? (
							<Box className="table-empty">Loading orders...</Box>
						) : orderLines.length ? (
							<>
								{orderLines.map((line) => (
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
												<span className="product-id">Order #{line.orderId.slice(-6)}</span>
												<span className="product-date">{formatDate(line.createdAt)}</span>
											</Box>
										</Stack>

										<span className="cell">{formatCurrency(line.unitPrice)}</span>
										<span className="cell">{line.quantity}</span>
										<span className="cell strong">{formatCurrency(line.subtotal)}</span>

										<Chip
											label={line.status ?? OrderStatus.PROCESS}
											className={`status-chip status-chip--${(line.status ?? OrderStatus.PROCESS)
												.toString()
												.toLowerCase()}`}
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
								))}

								{totalPages > 1 && (
									<Stack className="order-pagination">
										<Pagination page={inquiry.page} count={totalPages} onChange={handlePageChange} shape="rounded" />
									</Stack>
								)}
							</>
						) : (
							<Box className="table-empty">
								<img src="/img/icons/icoAlert.svg" alt="" />
								<span>Buy now bosilgan, lekin order topilmadi.</span>
							</Box>
						)}
					</Box>

					{/* RIGHT */}
					<Stack className="order-sidebar">
						<Box className="summary-card">
							<Typography className="summary-title">Summary</Typography>

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
								onClick={handleBuyNow}
								startIcon={<ShoppingCartCheckoutOutlinedIcon />}
							>
								Buy now
							</Button>

							<Button fullWidth variant="text" onClick={() => router.push('/property')}>
								Continue shopping
							</Button>
						</Box>

						<Box className="contact-card">
							<Typography className="contact-title">Customer & Payment</Typography>
							<p className="contact-desc">Ma’lumotlarni to‘ldiring. Card number ixtiyoriy, real payment emas.</p>

							<label>Full name</label>
							<input
								value={contact.fullName}
								placeholder="Your name"
								onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
							/>

							<label>Phone</label>
							<input
								value={contact.phone}
								placeholder="010-0000-0000"
								onChange={(e) => setContact({ ...contact, phone: e.target.value })}
							/>

							<label>Address</label>
							<input
								value={contact.address}
								placeholder="Your address"
								onChange={(e) => setContact({ ...contact, address: e.target.value })}
							/>

							<label>Note</label>
							<textarea
								value={contact.note}
								placeholder="Optional"
								onChange={(e) => setContact({ ...contact, note: e.target.value })}
							/>

							<label className="pay-label">
								<CreditCardRoundedIcon fontSize="small" /> Card number (optional)
							</label>
							<input
								value={contact.cardNumber}
								placeholder="1111 2222 3333 4444"
								onChange={(e) => setContact({ ...contact, cardNumber: e.target.value })}
							/>

							<Button
								variant="outlined"
								fullWidth
								onClick={() => {
									persistContact();
									sweetTopSmallSuccessAlert('Saved ✅', 900);
								}}
								startIcon={<LocalShippingOutlinedIcon />}
							>
								Save info
							</Button>

							<span className="contact-hint">
								{buyNowTriggered ? 'Orders are active (Buy now done).' : 'Buy now required to fetch orders.'}
							</span>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(OrderPage);
