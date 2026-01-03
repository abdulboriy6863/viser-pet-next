import { Product } from '../types/property/property';

export type BasketItem = {
	productId: string;
	quantity: number;
	product: Product;
};

export const BASKET_KEY = 'basket-items';
export const BASKET_EVENT = 'basket-updated';

const getBasketKey = (userId?: string) => (userId ? `${BASKET_KEY}:${userId}` : BASKET_KEY);

export const readBasket = (userId?: string): BasketItem[] => {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(getBasketKey(userId));
		return raw ? (JSON.parse(raw) as BasketItem[]) : [];
	} catch (err) {
		console.log('Failed to parse basket', err);
		return [];
	}
};

export const persistBasket = (items: BasketItem[], userId?: string, fireEvent: boolean = true) => {
	if (typeof window === 'undefined') return;
	localStorage.setItem(getBasketKey(userId), JSON.stringify(items));
	if (fireEvent) window.dispatchEvent(new CustomEvent(BASKET_EVENT, { detail: { items } }));
};

// productDiscount could be percent (<=100) or absolute value
export const calcDiscountedPrice = (product: Product | undefined | null): number => {
	const base = Number(product?.productPrice ?? 0);
	const discount = Number(product?.productDiscount ?? 0);
	if (discount <= 0) return base;
	const discountAmount = discount <= 100 ? (base * discount) / 100 : discount;
	return Math.max(0, base - discountAmount);
};

export const addToBasket = (product: Product, quantity: number = 1, userId?: string) => {
	if (!product?._id) return;
	const items = readBasket();
	const existingIdx = items.findIndex((i) => i.productId === product._id);

	if (existingIdx !== -1) {
		items[existingIdx].quantity += quantity;
	} else {
		items.push({ productId: product._id, quantity, product });
	}

	persistBasket(items);
	if (userId) persistBasket(items, userId, false);
	return items;
};

export const clearBasket = (userId?: string) => {
	persistBasket([], userId, !userId);
	return [];
};

export const removeFromBasket = (productId: string, userId?: string) => {
	const items = readBasket().filter((item) => item.productId !== productId);
	persistBasket(items);
	if (userId) persistBasket(items, userId, false);
	return items;
};

export const basketTotals = () => {
	const items = readBasket();
	const subtotal = items.reduce(
		(sum, item) => sum + calcDiscountedPrice(item.product) * Number(item.quantity ?? 0),
		0,
	);
	return { subtotal, items };
};

export const stashBasketForUser = (userId?: string) => {
	if (!userId) return [];
	const items = readBasket();
	persistBasket(items, userId, false);
	return items;
};

export const restoreBasketForUser = (userId?: string) => {
	if (!userId) return [];
	const items = readBasket(userId);
	persistBasket(items);
	return items;
};
