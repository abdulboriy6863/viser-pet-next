import React, { useMemo } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Product } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';

interface PopularPropertyCardProps {
	product: Product;
	likeProductHandler: (id: string) => Promise<void>;
}

const PopularPropertyCard = (props: PopularPropertyCardProps) => {
	const { product, likeProductHandler } = props;

	const productImage = useMemo(() => {
		if (product?.productImages && product.productImages[0]) {
			return `${REACT_APP_API_URL}/${product.productImages[0]}`;
		}
		return '';
	}, [product]);

	const isLiked = useMemo(() => !!product?.meLiked?.some((like) => like.myFavorite), [product]);

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

	const normalizeCount = (value: any, fallback: number = 0) => {
		if (Array.isArray(value)) return value.length;
		const n = Number(value);
		if (!Number.isFinite(n)) return fallback;
		return Math.max(0, Math.round(n));
	};

	const viewsCount = normalizeCount(product?.productViews);
	const commentsCount = normalizeCount(product?.productComments);
	const likesCount = normalizeCount(product?.productLikes ?? product?.meLiked);

	return (
		<Stack className="popular-card-box">
			<Box component={'div'} className={'popular-card-box__image'}>
				{badgeLabel && <span className={'popular-card-box__badge'}>{badgeLabel}</span>}
				{productImage ? (
					<img src={productImage} alt={product.productName} />
				) : (
					<span className={'popular-card-box__placeholder'} />
				)}
			</Box>

			<Box component={'div'} className={'popular-card-box__price'}>
				{hasDiscount && <span className={'popular-card-box__price--old'}>{formatPrice(basePrice)}</span>}
				<span className={'popular-card-box__price--new'}>{formatPrice(newPrice)}</span>
			</Box>

			<Typography className={'popular-card-box__title'}>{product.productName || 'Product'}</Typography>
			<Typography className={'popular-card-box__desc'} component="div">
				<div className="popular-card-box__desc-inner">{product.productDetail || product.productDesc || ''}</div>
			</Typography>

			<Box className={'popular-card-box__meta'}>
				<button
					type="button"
					className={`popular-card-box__meta-item popular-card-box__meta-item--like ${isLiked ? 'is-active' : ''}`}
					onClick={(e) => {
						e.stopPropagation();
						likeProductHandler?.(product._id);
					}}
					aria-label="Toggle like"
				>
					<img src="/img/icons/like.svg" alt="Likes" />
					<span>{likesCount}</span>
				</button>

				<div className="popular-card-box__meta-item">
					<img src="/img/icons/chat.svg" alt="Comments" />
					<span>{commentsCount}</span>
				</div>
				<div className="popular-card-box__meta-item">
					<RemoveRedEyeIcon />
					<span>{viewsCount}</span>
				</div>
			</Box>
		</Stack>
	);
};

export default PopularPropertyCard;
