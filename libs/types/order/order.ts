import { OrderStatus } from '../../enums/order.enum';
import { Member } from '../member/member';
import { MeLiked, Product, TotalCounter } from '../property/property';
import { CreateOrderInput, CreateOrderItemInput, OrderInquiry } from './order.input';

export interface Order {
	_id: string;
	orderStatus: OrderStatus;
	orderTotal: number;
	orderDelivery: number;
	orderItems: OrderItem[];
	productData: Product[];
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Orders {
	list: Order[];
	metaCounter: TotalCounter[];
}

export interface OrderItem {
	_id: string;
	itemQuantity: number;
	itemPrice: number;
	orderId: string;
	productId: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface OrderItems {
	list: OrderItem[];
	metaCounter: TotalCounter[];
}

export interface CreateOrderResponse {
	createOrder: Order;
}

export interface OrderItemsInput extends CreateOrderItemInput {}

export type { CreateOrderInput, OrderInquiry };
