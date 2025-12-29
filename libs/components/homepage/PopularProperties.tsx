import React, { useEffect, useMemo, useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Scrollbar } from 'swiper';
import PopularPropertyCard from './PopularPropertyCard';
import { Product } from '../../types/property/property';
import { ProductInquiry } from '../../types/property/property.input';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { ProductCollection } from '../../enums/property.enum';
import { userVar } from '../../../apollo/store';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';

type FeaturedCategory = 'cat' | 'dog' | 'fish' | 'small-pet';

const CATEGORY_COLLECTIONS: Record<FeaturedCategory, ProductCollection[]> = {
	cat: [
		ProductCollection.ANIMAL_CAT,
		ProductCollection.FOOD_CAT,
		ProductCollection.ACCESSORY_CAT,
		ProductCollection.TOY_CAT,
		ProductCollection.BED_CAT,
		ProductCollection.CLOTHING_CAT,
		ProductCollection.CLEANING_CAT,
		ProductCollection.MEDICINE_CAT,
	],
	dog: [
		ProductCollection.ANIMAL_DOG,
		ProductCollection.FOOD_DOG,
		ProductCollection.ACCESSORY_DOG,
		ProductCollection.TOY_DOG,
		ProductCollection.BED_DOG,
		ProductCollection.CLOTHING_DOG,
		ProductCollection.CLEANING_DOG,
		ProductCollection.MEDICINE_DOG,
	],
	fish: [ProductCollection.ANIMAL_FISH, ProductCollection.FOOD_FISH, ProductCollection.ACCESSORY_FISH],
	'small-pet': [ProductCollection.ANIMAL_OTHER, ProductCollection.ACCESSORY_GENERAL],
};

const FEATURED_CATEGORIES: { label: string; value: FeaturedCategory }[] = [
	{ label: 'Cat', value: 'cat' },
	{ label: 'Dog', value: 'dog' },
	{ label: 'Fish', value: 'fish' },
	{ label: 'Small Pet', value: 'small-pet' },
];

interface PopularPropertiesProps {
	initialInput: ProductInquiry;
}

const PopularProperties = (props: PopularPropertiesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [activeCategory, setActiveCategory] = useState<FeaturedCategory>('cat');
	const [products, setProducts] = useState<Product[]>([]);
	const user = useReactiveVar(userVar);

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	const {
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (getProductsData?.getProducts?.list) {
			setProducts(getProductsData.getProducts.list);
		}
	}, [getProductsData]);

	const filteredProducts = useMemo(() => {
		const allowed = CATEGORY_COLLECTIONS[activeCategory];
		return products.filter((product) => allowed.includes(product.productCollection));
	}, [products, activeCategory]);

	const slidesPerView = device === 'mobile' ? 1.05 : Math.min(4, Math.max(filteredProducts.length, 1));
	const spaceBetween = device === 'mobile' ? 16 : 28;
	const isError = !!getProductsError;
	const isLoading = !getProductsData && products.length === 0 && !isError;

	const likeProductHandler = async (productId: string) => {
		try {
			if (!productId) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProduct({ variables: { input: productId } });
			await getProductsRefetch({ input: initialInput });
		} catch (err: any) {
			sweetMixinErrorAlert(err?.message || 'Unable to like product');
		}
	};

	return (
		<Stack className={'popular-properties'}>
			<Stack className={'container'}>
				<img className="popular-properties__face" src="/img/featuresProduct/Fill-39.png" alt="" />
				<Stack className={'popular-properties__heading'}>
					<Box component={'div'} className={'popular-properties__title'}>
						<img src="/img/featuresProduct/Icon.png" alt="Featured products" />
						<div className={'popular-properties__title-row'}>
							<span className={'popular-properties__line popular-properties__line--wide'} />
							<h2>Featured Products</h2>
							<span className={'popular-properties__line popular-properties__line--wide'} />
						</div>
					</Box>
				</Stack>

				<Box className={'popular-properties__filters'}>
					{FEATURED_CATEGORIES.map((category) => (
						<button
							key={category.value}
							className={`popular-properties__filter ${activeCategory === category.value ? 'is-active' : ''}`}
							onClick={() => setActiveCategory(category.value)}
						>
							{category.label}
						</button>
					))}
				</Box>

				<Stack className={'card-box'}>
					{isError ? (
						<Box component={'div'} className={'empty-list'}>
							Unable to load featured products
						</Box>
					) : isLoading ? (
						<Box component={'div'} className={'empty-list'}>
							Loading...
						</Box>
					) : filteredProducts.length === 0 ? (
						<Box component={'div'} className={'empty-list'}>
							No products found
						</Box>
					) : (
						<Swiper
							className={'popular-property-swiper'}
							slidesPerView={slidesPerView}
							spaceBetween={spaceBetween}
							modules={[Pagination, Scrollbar]}
							pagination={{ clickable: true }}
							scrollbar={{ draggable: true, hide: false }}
							allowTouchMove={filteredProducts.length > slidesPerView}
							breakpoints={{
								640: { slidesPerView: 2.2 },
								900: { slidesPerView: 3 },
								1180: { slidesPerView: 4 },
							}}
						>
							{filteredProducts.map((product) => (
								<SwiperSlide key={product._id} className={'popular-property-slide'}>
									<PopularPropertyCard product={product} likeProductHandler={likeProductHandler} />
								</SwiperSlide>
							))}
						</Swiper>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

PopularProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 12,
		sort: 'productLikes',
		direction: 'DESC',
		search: {},
	},
};

export default PopularProperties;
