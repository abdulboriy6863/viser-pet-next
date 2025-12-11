import {
	ProductCollection,
	ProductStatus,
	PropertyLocation,
	PropertyStatus,
	PropertyType,
} from '../../enums/property.enum';
import { Member } from '../member/member';
////////////////////////////////////////////

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Property {
	_id: string;
	propertyType: PropertyType;
	propertyStatus: PropertyStatus;
	propertyLocation: PropertyLocation;
	propertyAddress: string;
	propertyTitle: string;
	propertyPrice: number;
	propertySquare: number;
	propertyBeds: number;
	propertyRooms: number;
	propertyViews: number;
	propertyLikes: number;
	propertyComments: number;
	propertyRank: number;
	propertyImages: string[];
	propertyDesc?: string;
	propertyBarter: boolean;
	propertyRent: boolean;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	constructedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Properties {
	list: Property[];
	metaCounter: TotalCounter[];
}

//VISER PET ////////////////////////////////////////////
export interface Product {
	_id: string;
	productCollection: ProductCollection;
	productStatus: ProductStatus;
	productName: string;
	productDetail: string;
	productDesc?: string;
	productPrice: number;
	productDiscount?: number;
	productLeftCount: number;
	productSoldCount: number;
	productViews: number;
	productLikes: number;
	productComments: number;
	productRank: number;
	productImages: string[];
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}
