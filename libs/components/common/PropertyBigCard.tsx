import React from 'react';
import { Stack, Box, Divider, Typography, IconButton } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Product } from '../../types/property/property';
import { REACT_APP_API_URL, topProductRank } from '../../config';
import { formatterStr } from '../../utils';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface PropertyBigCardProps {
	product: Product;
	likeProductHandler: (productId: string) => void | Promise<void>;
}

const PropertyBigCard = (props: PropertyBigCardProps) => {
	const { product, likeProductHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();

	const goPropertyDetailPage = (productId: string) => {
		router.push(`/property/detail?id=${productId}`);
	};

	if (device === 'mobile') return <div>APARTMEND BIG CARD</div>;

	const bgUrl = product?.productImages?.[0]
		? `${REACT_APP_API_URL}/${product.productImages[0]}`
		: '/img/property/defaultProperty.jpg'; // o‘zingda bo‘lmasa olib tashla

	return (
		<Stack className="property-big-card-box" onClick={() => goPropertyDetailPage(product?._id)}>
			<Box component="div" className="card-img" style={{ backgroundImage: `url(${bgUrl})` }}>
				{product?.productRank >= topProductRank && (
					<div className="status">
						<img src="/img/icons/electricity.svg" alt="" />
						<span>top</span>
					</div>
				)}

				<div className="price">${formatterStr(product?.productPrice)}</div>
			</Box>

			<Box component="div" className="info">
				<strong className="title">{product?.productDetail}</strong>
				<p className="desc">{product?.productDesc}</p>

				<Divider sx={{ mt: '15px', mb: '17px' }} />

				<div className="bott">
					<div>
						<span>Rent</span>
						<span>Barter</span>
					</div>

					<div className="buttons-box">
						{/* View */}
						<IconButton
							color="default"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.stopPropagation();
								// agar view clickda boshqa ish qilmoqchi bo‘lsang shu yerga yozasan
							}}
						>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{product?.productViews}</Typography>

						{/* Like */}
						<IconButton
							color="default"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.stopPropagation();
								void likeProductHandler(product?._id);
							}}
						>
							{product?.meLiked?.[0]?.myFavorite ? <FavoriteIcon sx={{ color: 'red' }} /> : <FavoriteBorderIcon />}
						</IconButton>

						<Typography className="view-cnt">{product?.productLikes}</Typography>
					</div>
				</div>
			</Box>
		</Stack>
	);
};

export default PropertyBigCard;
