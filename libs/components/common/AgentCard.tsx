import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface AgentCardProps {
	agent: any;
	likeMemberHandler: any;
}

const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	if (device === 'mobile') {
		return <div>AGENT CARD</div>;
	} else {
		return (
			<Stack className="agent-general-card">
				<Link
					href={{
						pathname: '/agent/detail',
						query: { agentId: agent?._id },
					}}
				>
					<Stack className={'agent-img'}>
						<Box className={'image-ring'}>
							<img src={imagePath} alt={agent?.memberFullName ?? agent?.memberNick ?? 'Agent'} />
						</Box>
						<div className={'badge'}>{agent?.memberProperties ?? 0} listings</div>
					</Stack>
				</Link>

				<Stack className={'agent-desc'}>
					<Box component={'div'} className={'agent-info'}>
						<Link
							href={{
								pathname: '/agent/detail',
								query: { agentId: agent?._id },
							}}
						>
							<Typography component={'strong'} className={'agent-name'}>
								{agent?.memberFullName ?? agent?.memberNick}
							</Typography>
						</Link>
						<Typography className={'agent-role'}>{agent?.memberType ?? 'Agent'}</Typography>
					</Box>
					<Stack className={'agent-meta'}>
						<Stack className={'stat'}>
							<RemoveRedEyeIcon fontSize="small" />
							<Typography className="stat-text">{agent?.memberViews}</Typography>
						</Stack>
						<Stack className={'stat'}>
							<IconButton color={'default'} onClick={() => likeMemberHandler(user, agent?._id)}>
								{agent?.meLiked && agent?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon color={'primary'} />
								) : (
									<FavoriteBorderIcon />
								)}
							</IconButton>
							<Typography className="stat-text">{agent?.memberLikes}</Typography>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default AgentCard;
