export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'on-hold';

export type OrderItem = {
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

export const seedOrders: OrderItem[] = [
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

export const orderStorageKey = (userId: string) => `vp_orders_${userId}`;

export const loadOrdersForUser = (userId?: string): OrderItem[] => {
	if (!userId || typeof window === 'undefined') return [];

	const storageKey = orderStorageKey(userId);
	const raw = window.localStorage.getItem(storageKey);
	if (!raw) return [];

	try {
		return JSON.parse(raw) as OrderItem[];
	} catch (err) {
		console.warn('order parse err', err);
		return [];
	}
};

export const saveOrdersForUser = (userId: string, orders: OrderItem[]) => {
	if (!userId || typeof window === 'undefined') return;
	const storageKey = orderStorageKey(userId);
	window.localStorage.setItem(storageKey, JSON.stringify(orders));
};

const formatPlacedOn = () =>
	new Date().toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});

const generateOrderId = () => `ORD-${Date.now().toString().slice(-5)}`;

type AddOrderPayload = {
	product: string;
	unitPrice: number;
	quantity?: number;
	sku?: string;
	thumbnail?: string;
	status?: OrderStatus;
	eta?: string;
};

export const addOrderForUser = (userId: string, payload: AddOrderPayload): OrderItem[] => {
	if (!userId || typeof window === 'undefined') return [];

	const existing = loadOrdersForUser(userId);
	const newOrder: OrderItem = {
		id: generateOrderId(),
		product: payload.product,
		sku: payload.sku || 'SKU-CUSTOM',
		placedOn: formatPlacedOn(),
		unitPrice: payload.unitPrice,
		quantity: payload.quantity || 1,
		status: payload.status || 'processing',
		eta: payload.eta || 'We will update delivery time soon.',
		thumbnail: payload.thumbnail || '/img/property/bigImage.png',
	};

	const updated = [newOrder, ...existing];
	saveOrdersForUser(userId, updated);
	return updated;
};
