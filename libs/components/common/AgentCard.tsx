import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography, IconButton } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';

import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import TwitterIcon from '@mui/icons-material/Twitter'; // ✅ XIcon yo‘q, shuni ishlatamiz
import YouTubeIcon from '@mui/icons-material/YouTube';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

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

	if (device === 'mobile') return <div>AGENT CARD</div>;

	return (
		<Stack className="agent-general-card">
			<Link
				href={{
					pathname: '/agent/detail',
					query: { agentId: agent?._id },
				}}
				className="agent-link"
			>
				{/* TOP */}
				<Box className="agent-top">
					<Box className="agent-photo">
						<img src={imagePath} alt={agent?.memberFullName ?? agent?.memberNick ?? 'Agent'} />
					</Box>
				</Box>

				{/* BOTTOM */}
				<Stack className="agent-bottom">
					<Typography className="agent-name">{agent?.memberFullName ?? agent?.memberNick ?? 'Agent'}</Typography>

					<Typography className="agent-role">{agent?.memberType ?? 'MANAGER'}</Typography>

					<Stack className="agent-socials" direction="row">
						{/* Social buttons: link click bo‘lib ketmasin */}
						<IconButton
							className="soc-btn"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<FacebookRoundedIcon />
						</IconButton>

						<IconButton
							className="soc-btn"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<TwitterIcon />
						</IconButton>

						<IconButton
							className="soc-btn"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<YouTubeIcon />
						</IconButton>

						<IconButton
							className="soc-btn"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
							}}
						>
							<LinkedInIcon />
						</IconButton>

						{/* Like */}
						<IconButton
							className="soc-btn"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
								likeMemberHandler(user, agent?._id);
							}}
						>
							{agent?.meLiked && agent?.meLiked[0]?.myFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
						</IconButton>
					</Stack>
				</Stack>
			</Link>
		</Stack>
	);
};

export default AgentCard;
