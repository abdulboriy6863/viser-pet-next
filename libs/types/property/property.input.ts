import {
	ProductCollection,
	ProductStatus,
	ProductVolume,
	PropertyLocation,
	PropertyStatus,
	PropertyType,
} from '../../enums/property.enum';
import { Direction } from '../../enums/common.enum';

// export interface PropertyInput {
// 	propertyType: PropertyType;
// 	propertyLocation: PropertyLocation;
// 	propertyAddress: string;
// 	propertyTitle: string;
// 	propertyPrice: number;
// 	propertySquare: number;
// 	propertyBeds: number;
// 	propertyRooms: number;
// 	propertyImages: string[];
// 	propertyDesc?: string;
// 	propertyBarter?: boolean;
// 	propertyRent?: boolean;
// 	memberId?: string;
// 	constructedAt?: Date;
// }

// interface PISearch {
// 	memberId?: string;
// 	locationList?: PropertyLocation[];
// 	typeList?: PropertyType[];
// 	roomsList?: Number[];
// 	options?: string[];
// 	bedsList?: Number[];
// 	pricesRange?: Range;
// 	periodsRange?: PeriodsRange;
// 	squaresRange?: Range;
// 	text?: string;
// }

export interface PropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface APISearch {
	propertyStatus?: PropertyStatus;
}

export interface AgentPropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: APISearch;
}

// interface ALPISearch {
// 	propertyStatus?: PropertyStatus;
// 	propertyLocationList?: PropertyLocation[];
// }

// export interface AllPropertiesInquiry {
// 	page: number;
// 	limit: number;
// 	sort?: string;
// 	direction?: Direction;
// 	search: ALPISearch;
// }

interface Range {
	start: number;
	end: number;
}

// interface PeriodsRange {
// 	start: Date | number;
// 	end: Date | number;
// }

//////////////VISER PET NEXT NEW INPUT TYPES/////////////////////
export interface ProductInput {
	propertyType: ProductCollection;
	productStatus: ProductStatus;
	productName: string;
	productDetail: string;
	productPrice: number;
	productDiscount?: number;
	productLeftCount?: number;
	productSoldCount?: number;
	productImages: string[];
	memberId?: string;
	constructedAt?: Date;
}

export interface PISearch {
	memberId?: string; // Product.memberId bilan mos
	typeList?: ProductCollection[]; // Product.productCollection bilan mos
	volumeList?: ProductVolume[]; // Product.productVolume bilan mos
	pricesRange?: Range; // Product.productPrice uchun
	text?: string; // Product.productName / productDetail / productDesc bo‘yicha qidiruv
	inStock?: boolean; // productLeftCount > 0
	discounted?: boolean; // productDiscount mavjudligi

	//bunga yana ishlov berish kerak bo'lishi mumkin
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

export interface ProductInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface APISearch {
	productStatus?: ProductStatus;
}

export interface AgentProductInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: APISearch;
}
