import { Product } from '../types/property/property';

export type BasketItem = {
	productId: string;
	quantity: number;
	product: Product;
};

export const BASKET_KEY = 'basket-items';
export const BASKET_EVENT = 'basket-updated';

export const readBasket = (): BasketItem[] => {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(BASKET_KEY);
		return raw ? (JSON.parse(raw) as BasketItem[]) : [];
	} catch (err) {
		console.log('Failed to parse basket', err);
		return [];
	}
};

export const persistBasket = (items: BasketItem[]) => {
	if (typeof window === 'undefined') return;
	localStorage.setItem(BASKET_KEY, JSON.stringify(items));
	window.dispatchEvent(new CustomEvent(BASKET_EVENT, { detail: { items } }));
};

// productDiscount could be percent (<=100) or absolute value
export const calcDiscountedPrice = (product: Product | undefined | null): number => {
	const base = Number(product?.productPrice ?? 0);
	const discount = Number(product?.productDiscount ?? 0);
	if (discount <= 0) return base;
	const discountAmount = discount <= 100 ? (base * discount) / 100 : discount;
	return Math.max(0, base - discountAmount);
};

export const addToBasket = (product: Product, quantity: number = 1) => {
	if (!product?._id) return;
	const items = readBasket();
	const existingIdx = items.findIndex((i) => i.productId === product._id);

	if (existingIdx !== -1) {
		items[existingIdx].quantity += quantity;
	} else {
		items.push({ productId: product._id, quantity, product });
	}

	persistBasket(items);
	return items;
};

export const clearBasket = () => persistBasket([]);

export const removeFromBasket = (productId: string) => {
	const items = readBasket().filter((item) => item.productId !== productId);
	persistBasket(items);
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
