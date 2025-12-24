import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { Product } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface TrendProductCardProps {
	product: Product;
	likeProductHandler: any;
}

const TrendProductCard = (props: TrendProductCardProps) => {
	const { product, likeProductHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const productImage = useMemo(() => {
		if (product?.productImages && product.productImages[0]) {
			return `${REACT_APP_API_URL}/${product.productImages[0]}`;
		}
		return '';
	}, [product]);

	const basePrice = product?.productPrice ?? 0;
	const discountValue = product?.productDiscount ?? 0;
	const hasDiscount = discountValue > 0;
	const isPercentDiscount = hasDiscount && discountValue <= 100;
	const isDiscountPrice = hasDiscount && discountValue > 100 && basePrice > 0 && discountValue < basePrice;
	const calculatedPrice = isPercentDiscount
		? basePrice * (1 - discountValue / 100)
		: isDiscountPrice
		? discountValue
		: basePrice;
	const newPrice = Math.max(calculatedPrice, 0);
	const derivedPercent = hasDiscount
		? isPercentDiscount
			? Math.max(1, Math.round(discountValue))
			: basePrice > 0
			? Math.max(1, Math.round((1 - newPrice / basePrice) * 100))
			: 0
		: 0;
	const badgeLabel = hasDiscount ? `-${derivedPercent}%` : null;

	const formatPrice = (value: number) =>
		`$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

	/** HANDLERS **/
	const pushDetailHandler = async (productId: string) => {
		await router.push({ pathname: '/product/detail', query: { id: productId } });
	};

	return (
		<Box className="trend-card" key={product._id}>
			<Box
				component={'div'}
				className={'trend-card__image'}
				onClick={() => {
					pushDetailHandler(product._id);
				}}
			>
				{badgeLabel && <Box className={'trend-card__badge'}>{badgeLabel}</Box>}
				<img src={productImage || '/img/property/sub1.png'} alt={product.productName} />
			</Box>

			<Box component={'div'} className={'trend-card__price'}>
				{hasDiscount && <span className={'trend-card__price--old'}>{formatPrice(basePrice)}</span>}
				<span className={'trend-card__price--new'}>{formatPrice(newPrice)}</span>
			</Box>

			<Typography
				className={'trend-card__title'}
				onClick={() => {
					pushDetailHandler(product._id);
				}}
			>
				{product.productName || product.productDetail || 'Product'}
			</Typography>

			{(product.productDetail || product.productDesc) && (
				<Typography className={'trend-card__desc'} component="div">
					<div className="trend-card__desc-inner">{product.productDetail || product.productDesc}</div>
				</Typography>
			)}
		</Box>
	);
};

export default TrendProductCard;
