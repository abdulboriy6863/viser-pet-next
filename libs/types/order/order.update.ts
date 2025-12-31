import { OrderStatus } from '../../enums/order.enum';

export interface OrderUpdate {
	_id: string;
	orderDelivery?: number;
	orderTotal?: number;
	orderStatus?: OrderStatus;
}
