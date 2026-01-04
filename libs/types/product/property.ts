import { ProductCollection, ProductStatus, ProductVolume } from '../../enums/property.enum';
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

//VISER PET ////////////////////////////////////////////
export interface Product {
	_id: string;
	productCollection: ProductCollection;
	productStatus: ProductStatus;
	productVolume: ProductVolume;
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
	constructedAt?: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}
