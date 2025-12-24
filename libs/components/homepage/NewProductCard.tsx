import React, { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Product } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';

interface NewProductCardProps {
	product: Product;
}

const NewProductCard = (props: NewProductCardProps) => {
	const { product } = props;

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

	return (
		<Stack className="new-product-card">
			<Box className="new-product-card__image">
				{badgeLabel && <span className="new-product-card__badge">{badgeLabel}</span>}
				{productImage ? <img src={productImage} alt={product.productName} /> : <span className="new-product-card__placeholder" />}
			</Box>
			<Box className="new-product-card__price">
				{hasDiscount && <span className="new-product-card__price--old">{formatPrice(basePrice)}</span>}
				<span className="new-product-card__price--new">{formatPrice(newPrice)}</span>
			</Box>
			<Typography className="new-product-card__title">{product.productName || 'Product'}</Typography>
			{(product.productDetail || product.productDesc) && (
				<Typography className="new-product-card__desc">{product.productDetail || product.productDesc}</Typography>
			)}
		</Stack>
	);
};

export default NewProductCard;
