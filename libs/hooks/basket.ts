// libs/hooks/basket.ts
import { Product } from '../types/product/property';

export type BasketStoredItem = {
	memberId: string; // userId
	productId: string;

	productName: string;
	productImage: string;
	quantity: number;

	unitPrice: number; // discounted yoki original snapshot
	originalPrice: number;
	discountValue: number;

	createdAt: string;
	updatedAt: string;
};

export const BASKET_EVENT = 'basket-updated';

const getBasketKey = (userId: string) => `basket_${userId}`;
const getStashKey = (userId: string) => `basket_stash_${userId}`;

const safeParse = <T>(raw: string | null, fallback: T): T => {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
};

export const calcDiscountedPrice = (product: Product | undefined | null): number => {
	const base = Number(product?.productPrice ?? 0);
	const discount = Number(product?.productDiscount ?? 0);
	if (!discount || discount <= 0) return base;

	const discountAmount = discount <= 100 ? (base * discount) / 100 : discount;
	return Math.max(0, base - discountAmount);
};

export const readBasket = (userId?: string): BasketStoredItem[] => {
	if (typeof window === 'undefined') return [];
	if (!userId) return [];
	return safeParse<BasketStoredItem[]>(localStorage.getItem(getBasketKey(userId)), []);
};

export const persistBasket = (userId: string, items: BasketStoredItem[]) => {
	if (typeof window === 'undefined') return;
	localStorage.setItem(getBasketKey(userId), JSON.stringify(items));
	window.dispatchEvent(new Event(BASKET_EVENT));
};

export const basketTotals = (userId?: string) => {
	const items = readBasket(userId);
	const subtotal = items.reduce((sum, x) => sum + (Number(x.quantity) || 0) * (Number(x.unitPrice) || 0), 0);
	const count = items.reduce((sum, x) => sum + (Number(x.quantity) || 0), 0);
	return { items, subtotal, count };
};

export const addToBasket = (product: Product, quantity: number = 1, userId?: string) => {
	if (typeof window === 'undefined') return [];
	if (!userId) return [];
	if (!product?._id) return [];

	const now = new Date().toISOString();
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
						unitPrice,
						originalPrice,
						discountValue,
						updatedAt: now,
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
		createdAt: now,
		updatedAt: now,
	};

	const next = [newItem, ...items];
	persistBasket(userId, next);
	return next;
};

export const decreaseOrRemove = (productId: string, userId?: string) => {
	if (typeof window === 'undefined') return [];
	if (!userId) return [];

	const now = new Date().toISOString();
	const items = readBasket(userId);
	const idx = items.findIndex((x) => x.productId === productId);
	if (idx < 0) return items;

	const q = Number(items[idx].quantity) || 0;
	let next: BasketStoredItem[];

	if (q <= 1) next = items.filter((x) => x.productId !== productId);
	else next = items.map((x) => (x.productId === productId ? { ...x, quantity: q - 1, updatedAt: now } : x));

	persistBasket(userId, next);
	return next;
};

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

	localStorage.removeItem(getBasketKey(userId));
	window.dispatchEvent(new Event(BASKET_EVENT));
	return [];
};

/**
 * ✅ MUHIM: Agar logOut() localStorage.clear() qilsa ham basket saqlanib qolishi uchun
 * logoutdan oldin stash qilib qo‘yamiz.
 */
export const stashBasketForUser = (userId?: string) => {
	if (typeof window === 'undefined') return;
	if (!userId) return;

	const key = getBasketKey(userId);
	const stashKey = getStashKey(userId);
	const raw = localStorage.getItem(key);

	if (raw) localStorage.setItem(stashKey, raw);
};

/**
 * ✅ Login bo‘lganda stashdan qaytarib beradi
 */
export const restoreBasketForUser = (userId?: string) => {
	if (typeof window === 'undefined') return;
	if (!userId) return;

	const key = getBasketKey(userId);
	const stashKey = getStashKey(userId);
	const raw = localStorage.getItem(stashKey);

	// agar basket yo‘q, lekin stash bor bo‘lsa — restore
	if (!localStorage.getItem(key) && raw) {
		localStorage.setItem(key, raw);
	}
	// stashni tozalab yuboramiz (istasa qoldirsa ham bo‘ladi)
	if (raw) localStorage.removeItem(stashKey);

	window.dispatchEvent(new Event(BASKET_EVENT));
};

// Top.tsx uchun subscribe
export const subscribeBasket = (userId: string | undefined, onChange: () => void) => {
	if (typeof window === 'undefined') return () => {};
	if (!userId) return () => {};

	const key = getBasketKey(userId);

	const onBasketEvent = () => onChange();
	const onStorage = (e: StorageEvent) => {
		if (e.key === key) onChange();
	};

	window.addEventListener(BASKET_EVENT, onBasketEvent);
	window.addEventListener('storage', onStorage);

	return () => {
		window.removeEventListener(BASKET_EVENT, onBasketEvent);
		window.removeEventListener('storage', onStorage);
	};
};
