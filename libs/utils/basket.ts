import { Product } from '../types/property/property';

export type BasketItem = {
	productId: string;
	quantity: number;
	product: Product;
};

export const BASKET_KEY = 'basket-items';
export const BASKET_EVENT = 'basket-updated';

export const readBasket = (): BasketItem[] => [];

export const persistBasket = (_items: BasketItem[]) => undefined;

// productDiscount could be percent (<=100) or absolute value
export const calcDiscountedPrice = (product: Product | undefined | null): number => {
	const base = Number(product?.productPrice ?? 0);
	const discount = Number(product?.productDiscount ?? 0);
	if (discount <= 0) return base;
	const discountAmount = discount <= 100 ? (base * discount) / 100 : discount;
	return Math.max(0, base - discountAmount);
};

export const addToBasket = (product: Product, quantity: number = 1, userId?: string) => {
	return [];
};

export const clearBasket = (userId?: string) => {
	return [];
};

export const removeFromBasket = (productId: string, userId?: string) => {
	return [];
};

export const basketTotals = () => {
	return { subtotal: 0, items: [] as BasketItem[] };
};

export const stashBasketForUser = (userId?: string) => {
	return [];
};

export const restoreBasketForUser = (userId?: string) => {
	return [];
};
