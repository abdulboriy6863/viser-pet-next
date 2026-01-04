// libs/hooks/basket.ts
import { Product } from '../types/property/property';

export type BasketStoredItem = {
	memberId: string;
	productId: string;
	productName: string;
	productImage: string;
	quantity: number;

	// price snapshot (order uchun juda muhim)
	unitPrice: number; // discounted price (yoki original)
	originalPrice: number;
	discountValue: number; // productDiscount
};

export const BASKET_EVENT = 'basket-updated';

const getBasketKey = (userId?: string) => `basket_${userId || 'guest'}`;

// productDiscount could be percent (<=100) or absolute value
export const calcDiscountedPrice = (product: Product | undefined | null): number => {
	const base = Number(product?.productPrice ?? 0);
	const discount = Number(product?.productDiscount ?? 0);
	if (!discount || discount <= 0) return base;

	const discountAmount = discount <= 100 ? (base * discount) / 100 : discount;
	return Math.max(0, base - discountAmount);
};

const safeParse = <T>(raw: string | null, fallback: T): T => {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
};

export const readBasket = (userId?: string): BasketStoredItem[] => {
	if (typeof window === 'undefined') return [];
	if (!userId) return [];
	const key = getBasketKey(userId);
	return safeParse<BasketStoredItem[]>(localStorage.getItem(key), []);
};

export const persistBasket = (userId: string, items: BasketStoredItem[]) => {
	if (typeof window === 'undefined') return;
	const key = getBasketKey(userId);
	localStorage.setItem(key, JSON.stringify(items));
	// Top.tsx shu event orqali auto refresh qiladi
	window.dispatchEvent(new Event(BASKET_EVENT));
};

export const addToBasket = (product: Product, quantity: number = 1, userId?: string) => {
	if (typeof window === 'undefined') return [];
	if (!userId) return [];
	if (!product?._id) return [];

	const items = readBasket(userId);

	const productId = String(product._id);
	const idx = items.findIndex((x) => x.productId === productId);

	const unitPrice = calcDiscountedPrice(product);
	const originalPrice = Number(product.productPrice ?? 0);
	const discountValue = Number(product.productDiscount ?? 0);

	const nextQty = Math.max(1, Number(quantity || 1));

	if (idx >= 0) {
		const next = items.map((x, i) =>
			i === idx
				? {
						...x,
						quantity: (Number(x.quantity) || 0) + nextQty,
				  }
				: x,
		);
		persistBasket(userId, next);
		return next;
	}

	const newItem: BasketStoredItem = {
		memberId: userId,
		productId,
		productName: product.productName ?? '',
		productImage: product.productImages?.[0] ?? '',
		quantity: nextQty,
		unitPrice,
		originalPrice,
		discountValue,
	};

	const next = [newItem, ...items];
	persistBasket(userId, next);
	return next;
};

// minus: qty > 1 => -1, qty == 1 => remove (local ham)
export const decreaseOrRemove = (productId: string, userId?: string) => {
	if (typeof window === 'undefined') return [];
	if (!userId) return [];
	const items = readBasket(userId);

	const idx = items.findIndex((x) => x.productId === productId);
	if (idx < 0) return items;

	const target = items[idx];
	const q = Number(target.quantity) || 0;

	let next: BasketStoredItem[];
	if (q <= 1) {
		next = items.filter((x) => x.productId !== productId);
	} else {
		next = items.map((x) => (x.productId === productId ? { ...x, quantity: q - 1 } : x));
	}

	persistBasket(userId, next);
	return next;
};

// trash: itemni to‘liq o‘chiradi (local ham)
export const removeItem = (productId: string, userId?: string) => {
	if (typeof window === 'undefined') return [];
	if (!userId) return [];
	const items = readBasket(userId);
	const next = items.filter((x) => x.productId !== productId);
	persistBasket(userId, next);
	return next;
};

export const clearBasket = (userId?: string) => {
	if (typeof window === 'undefined') return [];
	if (!userId) return [];
	const key = getBasketKey(userId);
	localStorage.removeItem(key);
	window.dispatchEvent(new Event(BASKET_EVENT));
	return [];
};

export const basketTotals = (userId?: string) => {
	const items = readBasket(userId);

	const subtotal = items.reduce((sum, x) => {
		const q = Number(x.quantity) || 0;
		const p = Number(x.unitPrice) || 0;
		return sum + q * p;
	}, 0);

	const count = items.reduce((sum, x) => sum + (Number(x.quantity) || 0), 0);

	return { items, subtotal, count };
};

// libs/hooks/basket.ts (PASTGA QO‘SH)

export const stashBasketForUser = (userId?: string) => {
	if (typeof window === 'undefined') return [];
	if (!userId) return [];

	const userKey = `basket_${userId}`;
	const guestKey = `basket_guest`;

	const items = safeParse(localStorage.getItem(userKey), []);
	if (items.length) {
		localStorage.setItem(guestKey, JSON.stringify(items));
	}

	localStorage.removeItem(userKey);
	window.dispatchEvent(new Event(BASKET_EVENT));
	return items;
};

export const restoreBasketForUser = (userId?: string) => {
	if (typeof window === 'undefined') return [];
	if (!userId) return [];

	const userKey = `basket_${userId}`;
	const guestKey = `basket_guest`;

	const guestItems = safeParse(localStorage.getItem(guestKey), []);
	if (guestItems.length) {
		localStorage.setItem(userKey, JSON.stringify(guestItems));
		localStorage.removeItem(guestKey);
	}

	window.dispatchEvent(new Event(BASKET_EVENT));
	return guestItems;
};
