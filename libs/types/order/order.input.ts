import { OrderStatus } from '../../enums/order.enum';

export interface CreateOrderItemInput {
	productId: string;
	memberId: string;
	itemQuantity: number;
	itemPrice: number;
}

/**
 * Aligns with backend mutation: expects `items` array (not orderItems) and optional status.
 * Delivery/total are calculated server-side.
 */
export interface CreateOrderInput {
	memberId: string;
	orderStatus?: OrderStatus;
	items: CreateOrderItemInput[];
}

export interface OrderInquiry {
	page?: number;
	limit?: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search?: Record<string, any>;
}
