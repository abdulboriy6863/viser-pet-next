import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Stack, Typography, Button } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyProperties from '../../libs/components/mypage/MyProperties';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import AddProperty from '../../libs/components/mypage/AddNewProperty';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import MyOrders from '../../libs/components/mypage/MyOrders';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MyMenu from '../../libs/components/mypage/MyMenu';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category: any = router.query?.category ?? 'myProfile';

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user._id) router.push('/').then();
	}, [user]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({
				variables: {
					input: id,
				},
			});

			await sweetTopSmallSuccessAlert('Subscribed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({
				variables: {
					input: id,
				},
			});

			await sweetTopSmallSuccessAlert('Unsubscribed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});

			await sweetTopSmallSuccessAlert('Success!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	if (device === 'mobile') {
		return <div>MY PAGE</div>;
	} else {
		return (
			<div id="my-page">
				<div className="container">
					<div className="mypage-shell">
						<div className="mypage-hero">
							<div className="hero-grid">
								<div className="hero-copy">
									<span className="pill">Personal workspace</span>
									<Typography component="h1" className="hero-title">
										Welcome back, {user?.memberNick ?? 'Explorer'}
									</Typography>
									<p className="hero-desc">
										Manage listings, favorites, followers, orders, and articles from a single control center.
									</p>

									<div className="hero-actions">
										<Button
											className="hero-btn primary"
											variant="contained"
											onClick={() => router.push('/mypage?category=myProfile')}
										>
											Edit profile
										</Button>
										{user?.memberType === 'AGENT' && (
											<Button
												className="hero-btn ghost"
												variant="outlined"
												onClick={() => router.push('/mypage?category=addProperty')}
											>
												Add property
											</Button>
										)}
									</div>
								</div>

								<div className="hero-panels">
									<div className="hero-card">
										<span className="eyebrow">Account type</span>
										<strong>{user?.memberType ?? 'Member'}</strong>
										<p>Stay up to date with your workspace.</p>
									</div>
									<div className="hero-card">
										<span className="eyebrow">Shortcuts</span>
										<ul>
											<li>Favorites & Recent views</li>
											<li>Followers & Following</li>
											<li>Orders & Articles</li>
										</ul>
									</div>
								</div>
							</div>
						</div>

						<div className="mypage-layout">
							<div className="mypage-nav-card">
								<MyMenu />
							</div>

							<div className="mypage-content-card">
								<div className="mypage-content-inner">
									{category === 'addProperty' && <AddProperty />}
									{category === 'myProperties' && <MyProperties />}
									{category === 'myFavorites' && <MyFavorites />}
									{category === 'recentlyVisited' && <RecentlyVisited />}
									{category === 'myArticles' && <MyArticles />}
									{category === 'writeArticle' && <WriteArticle />}
									{category === 'myProfile' && <MyProfile />}
									{category === 'followers' && (
										<MemberFollowers
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
											likeMemberHandler={likeMemberHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
										/>
									)}
									{category === 'followings' && (
										<MemberFollowings
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
											likeMemberHandler={likeMemberHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
										/>
									)}
									{category === 'myOrders' && <MyOrders />}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(MyPage);
