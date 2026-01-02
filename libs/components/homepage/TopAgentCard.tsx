import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

interface TopAgentProps {
	agent: Member;
	likeMemberHandler?: (id: string) => void;
}
const TopAgentCard = (props: TopAgentProps) => {
	const { agent, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();

	const normalizeCount = (value: any, fallback = 0) => {
		if (Array.isArray(value)) return value.length;
		const num = Number(value);
		if (!Number.isFinite(num)) return fallback;
		return Math.max(0, Math.round(num));
	};

	const productsCount = normalizeCount(agent?.memberProducts);
	const likesCount = normalizeCount(agent?.memberLikes);
	const viewsCount = normalizeCount(agent?.memberViews);
	const isLiked = !!agent?.meLiked?.some((like) => like.myFavorite);
	const agentImage = agent?.memberImage
		? `${process.env.REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/

	if (device === 'mobile') {
		return (
			<Stack className="top-agent-card">
				<img src={agentImage} alt="" />

				<strong>{agent?.memberNick}</strong>
				<span>{agent?.memberType}</span>
				<div className="top-agent-card__meta">
					<div className="top-agent-card__meta-item">
						<img src="/img/icons/home.svg" alt="Products" />
						<span>{productsCount}</span>
					</div>
					<button
						type="button"
						className={`top-agent-card__meta-item top-agent-card__meta-item--like ${isLiked ? 'is-active' : ''}`}
						onClick={(e) => {
							e.stopPropagation();
							likeMemberHandler?.(agent?._id);
						}}
						aria-label="Toggle like"
					>
						{isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
						<span>{likesCount}</span>
					</button>
					<div className="top-agent-card__meta-item">
						<img src="/img/icons/review.svg" alt="Views" />
						<span>{viewsCount}</span>
					</div>
				</div>
			</Stack>
		);
	} else {
		return (
			<Stack className="top-agent-card">
				<img src={agentImage} alt="" />

				<strong>{agent?.memberNick}</strong>
				<span>{agent?.memberType}</span>
				<div className="top-agent-card__meta">
					<div className="top-agent-card__meta-item">
						<img src="/img/icons/home.svg" alt="Products" />
						<span>{productsCount}</span>
					</div>
					<button
						type="button"
						className={`top-agent-card__meta-item top-agent-card__meta-item--like ${isLiked ? 'is-active' : ''}`}
						onClick={(e) => {
							e.stopPropagation();
							likeMemberHandler?.(agent?._id);
						}}
						aria-label="Toggle like"
					>
						{isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
						<span>{likesCount}</span>
					</button>
					<div className="top-agent-card__meta-item">
						<img src="/img/icons/review.svg" alt="Views" />
						<span>{viewsCount}</span>
					</div>
				</div>
			</Stack>
		);
	}
};

export default TopAgentCard;
