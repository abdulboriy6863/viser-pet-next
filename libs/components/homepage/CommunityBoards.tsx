import React, { useState } from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import CommunityCard from './CommunityCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { T } from '../../types/common';

const CommunityBoards = () => {
	const device = useDeviceDetect();
	const [searchCommunity, setSearchCommunity] = useState({
		page: 1,
		sort: 'articleViews',
		direction: 'DESC',
	});
	const [newsArticles, setNewsArticles] = useState<BoardArticle[]>([]);
	const [freeArticles, setFreeArticles] = useState<BoardArticle[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: getNewArticlesLoading,
		data: getNewArticlesData,
		error: getNewArticlesError,
		refetch: getNewAriclesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { ...searchCommunity, limit: 6, search: { articleCategory: BoardArticleCategory.NEWS } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFreeArticles(data?.getBoardArticles?.list);
		},
	});

	const {
		loading: getFreeArticlesLoading,
		data: getFreeArticlesData,
		error: getFreeArticlesError,
		refetch: getFreeArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { ...searchCommunity, limit: 3, search: { articleCategory: BoardArticleCategory.FREE } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFreeArticles(data?.getBoardArticles?.list);
		},
	});

	// const {
	// 	loading: getHumorArticlesLoading,
	// 	data: getHumorArticlesData,
	// 	error: getHumorArticlesError,
	// 	refetch: getHumorArticlesRefetch,
	// } = useQuery(GET_BOARD_ARTICLES, {
	// 	fetchPolicy: 'network-only',
	// 	variables: { ...searchCommunity, limit: 6, search: { articleCategory: BoardArticleCategory.HUMOR } },
	// 	notifyOnNetworkStatusChange: true,
	// 	onCompleted: (data: T) => {
	// 		setFreeArticles(data?.getBoardArticles?.list);
	// 	},
	// });

	// const {
	// 	loading: getRecommendArticlesLoading,
	// 	data: getRecommendArticlesData,
	// 	error: getRecommendArticlesError,
	// 	refetch: getRecommendArticlesRefetch,
	// } = useQuery(GET_BOARD_ARTICLES, {
	// 	fetchPolicy: 'network-only',
	// 	variables: { ...searchCommunity, limit: 6, search: { articleCategory: BoardArticleCategory.RECOMMEND } },
	// 	notifyOnNetworkStatusChange: true,
	// 	onCompleted: (data: T) => {
	// 		setFreeArticles(data?.getBoardArticles?.list);
	// 	},
	// });

	if (device === 'mobile') {
		return <div>COMMUNITY BOARDS (MOBILE)</div>;
	} else {
		return (
			<Stack className={'community-board'}>
				<Stack className={'container'}>
					<Stack>
						<Typography variant={'h1'}>COMMUNITY BOARD HIGHLIGHTS</Typography>
					</Stack>
					<Stack className="community-main">
						<Stack className={'community-left'}>
							<Stack className={'content-top'}>
								<Link href={'/community?articleCategory=NEWS'}>
									<span>News</span>
								</Link>
								<img src="/img/icons/arrowBig.svg" alt="" />
							</Stack>
							<Stack className={'card-wrap'}>
								{newsArticles.map((article, index) => {
									return <CommunityCard vertical={true} article={article} index={index} key={article?._id} />;
								})}
							</Stack>
						</Stack>
						<Stack className={'community-right'}>
							<Stack className={'content-top'}>
								<Link href={'/community?articleCategory=FREE'}>
									<span>Free</span>
								</Link>
								<img src="/img/icons/arrowBig.svg" alt="" />
							</Stack>
							<Stack className={'card-wrap vertical'}>
								{freeArticles.map((article, index) => {
									return <CommunityCard vertical={false} article={article} index={index} key={article?._id} />;
								})}
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CommunityBoards;
