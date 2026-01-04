import { ProductCollection, ProductStatus, ProductVolume } from '../../enums/property.enum';

export interface ProductUpdate {
	_id: string;
	productVoume?: ProductVolume;
	productStatus?: ProductStatus;
	productCollection?: ProductCollection;
	productName?: string;
	productDetail?: string;
	productPrice?: number;
	productDiscount?: number;
	productLeftCount?: number;
	productSoldCount?: number;
	productImages?: string[];
	propertyDesc?: string;
	soldAt?: Date;
	deletedAt?: Date;
	constructedAt?: Date;
}
