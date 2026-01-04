import {
	ProductCollection,
	ProductStatus,
	ProductVolume,
	PropertyLocation,
	PropertyStatus,
	PropertyType,
} from '../../enums/property.enum';

// export interface PropertyUpdate {
// 	_id: string;
// 	propertyType?: PropertyType;
// 	propertyStatus?: PropertyStatus;
// 	propertyLocation?: PropertyLocation;
// 	propertyAddress?: string;
// 	propertyTitle?: string;
// 	propertyPrice?: number;
// 	propertySquare?: number;
// 	propertyBeds?: number;
// 	propertyRooms?: number;
// 	propertyImages?: string[];
// 	propertyDesc?: string;
// 	propertyBarter?: boolean;
// 	propertyRent?: boolean;
// 	soldAt?: Date;
// 	deletedAt?: Date;
// 	constructedAt?: Date;
// }

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
