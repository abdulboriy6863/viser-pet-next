import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, Avatar, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HistoryIcon from '@mui/icons-material/History';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import AddHomeWorkOutlinedIcon from '@mui/icons-material/AddHomeWorkOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutIcon from '@mui/icons-material/Logout';

const MyMenu = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const category: any = router.query?.category ?? 'myProfile';
	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	if (device === 'mobile') {
		return <div>MY MENU</div>;
	}

	const navSections = [
		{
			title: 'Workspace',
			items: [
				{ id: 'myProfile', label: 'My Profile', icon: <PersonOutlineOutlinedIcon /> },
				{ id: 'myFavorites', label: 'My Favorites', icon: <FavoriteBorderIcon /> },
				{ id: 'recentlyVisited', label: 'Recently Visited', icon: <HistoryIcon /> },
			],
		},
		{
			title: 'Connections',
			items: [
				{ id: 'followers', label: 'My Followers', icon: <GroupIcon /> },
				{ id: 'followings', label: 'My Following', icon: <PersonAddAlt1Icon /> },
				{ id: 'myOrders', label: 'My Orders', icon: <ShoppingBagIcon /> },
			],
		},
		//o'zgartirdim myorder
		{
			title: 'Listings',
			items:
				user?.memberType === 'AGENT'
					? [
							{ id: 'addProperty', label: 'Add Product', icon: <AddHomeWorkOutlinedIcon /> },
							{ id: 'myProperties', label: 'My Products', icon: <HomeWorkOutlinedIcon /> },
					  ]
					: [],
		},
		{
			title: 'Community',
			items: [
				{ id: 'myArticles', label: 'Blog Post', icon: <ArticleOutlinedIcon /> },
				{ id: 'writeArticle blogPost', label: 'Write Blog Post', icon: <EditNoteOutlinedIcon /> },
			],
		},
	].filter((section) => section.items.length);

	return (
		<Stack className="mypage-nav" spacing={3}>
			<Stack className="nav-header" spacing={1.2}>
				<Avatar
					className="nav-avatar"
					src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
					alt={user?.memberNick ?? 'User'}
					sx={{ width: 72, height: 72 }}
				/>
				<div>
					<Typography className="nav-name">{user?.memberNick ?? 'Guest user'}</Typography>
					<Typography className="nav-phone">{user?.memberPhone ?? '+000 000 0000'}</Typography>
					<Typography className="nav-tag">{user?.memberType ?? 'Member'}</Typography>
				</div>
			</Stack>

			<div className="nav-divider" />

			{navSections.map((section) => (
				<div key={section.title} className="nav-section">
					<Typography className="nav-section-title">{section.title}</Typography>
					<ul className="nav-list">
						{section.items.map((item) => {
							const isActive = category === item.id;
							return (
								<li key={item.id}>
									<Link
										href={{
											pathname: '/mypage',
											query: { category: item.id },
										}}
										scroll={false}
									>
										<button type="button" className={`nav-item ${isActive ? 'is-active' : ''}`}>
											<span className="nav-icon">{item.icon}</span>
											<span className="nav-label">{item.label}</span>
											<span className="nav-chevron">↗</span>
										</button>
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			))}

			<div className="nav-footer">
				<Button className="nav-logout" onClick={logoutHandler} startIcon={<LogoutIcon />}>
					Logout
				</Button>
			</div>
		</Stack>
	);
};

export default MyMenu;
