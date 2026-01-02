import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import TopAgentCard from './TopAgentCard';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_AGENTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_MEMBER } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Messages } from '../../config';

interface TopAgentsProps {
	initialInput: AgentsInquiry;
}

const TopAgents = (props: TopAgentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [topAgents, setTopAgents] = useState<Member[]>([]);
	const highlightedAgentsCount = topAgents?.length || 0;
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** APOLLO REQUESTS **/
	const {
		loading: getAgentsLoading,
		data: getAgentsData,
		error: getAgentsError,
		refetch: getAgentsRefetch,
	} = useQuery(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopAgents(data?.getAgents?.list);
		},
	});
	/** HANDLERS **/
	const handleSeeAll = () => {
		router.push('/agent');
	};
	console.log('RUN ON SERVER');
	const renderedSlides = topAgents.map((agent: Member) => {
		return (
			<SwiperSlide className={'top-agents-slide'} key={agent?._id}>
				<TopAgentCard
					agent={agent}
					key={agent?.memberNick}
					likeMemberHandler={async (agentId: string) => {
						try {
							if (!agentId) return;
							if (!user?._id) throw new Error(Messages.error2);
							await likeTargetMember({ variables: { input: agentId } });
							await getAgentsRefetch({ input: initialInput });
						} catch (err: any) {
							sweetMixinErrorAlert(err?.message || 'Unable to like agent');
						}
					}}
				/>
			</SwiperSlide>
		);
	});

	if (isMobile) {
		return (
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box top-agents__info'}>
						<span className={'top-agents__eyebrow'}>Featured agents</span>
						<Box component={'div'} className={'top-agents__heading'}>
							<span>Top Agents</span>
							<p>Quick, reliable guidance from people who know every corner.</p>
						</Box>
						<Box component={'div'} className={'top-agents__stats top-agents__stats--compact'}>
							<div className={'stat'}>
								<strong>{highlightedAgentsCount}+</strong>
								<span>verified specialists</span>
							</div>
							<div className={'stat'}>
								<strong>1:1</strong>
								<span>concierge support</span>
							</div>
						</Box>
						<Box component={'div'} className={'top-agents__actions'}>
							<button className={'top-agents__cta'} onClick={handleSeeAll}>
								See all agents
							</button>
						</Box>
					</Stack>
					<Stack className={'wrapper'}>
						<Swiper
							className={'top-agents-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={18}
							modules={[]}
						>
							{renderedSlides}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Box component={'div'} className={'top-agents__halo top-agents__halo--left'} />
					<Box component={'div'} className={'top-agents__halo top-agents__halo--right'} />
					<Stack className={'info-box top-agents__info'}>
						<Box component={'div'} className={'top-agents__head'}>
							<Box component={'div'} className={'left'}>
								<span>Top Agents</span>
								{/* <Box component={'div'} className={'top-agents__tags'}>
									<span className={'pill'}>Local insight</span>
									<span className={'pill'}>Fast replies</span>
									<span className={'pill'}>Guided tours</span>
								</Box> */}
							</Box>
							<Box component={'div'} className={'right'}>
								<button className={'top-agents__cta'} onClick={handleSeeAll}>
									See all agents
								</button>
								<span className={'top-agents__note'}>Speak with a specialist in minutes</span>
							</Box>
						</Box>
						{/* <Box component={'div'} className={'top-agents__stats'}>
							<div className={'stat'}>
								<strong>{highlightedAgentsCount}+</strong>
								<span>curated agents this week</span>
							</div>
							<div className={'stat'}>
								<strong>Neighbourhood pros</strong>
								<span>Matching you with the right area</span>
							</div>
							<div className={'stat'}>
								<strong>Tour-ready</strong>
								<span>Private showings and guided visits</span>
							</div>
						</Box> */}
					</Stack>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'switch-btn swiper-agents-prev'}>
							<ArrowBackIosNewIcon />
						</Box>
						<Box component={'div'} className={'card-wrapper'}>
							<Swiper
								className={'top-agents-swiper'}
								slidesPerView={'auto'}
								spaceBetween={24}
								modules={[Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-agents-next',
									prevEl: '.swiper-agents-prev',
								}}
							>
								{renderedSlides}
							</Swiper>
						</Box>
						<Box component={'div'} className={'switch-btn swiper-agents-next'}>
							<ArrowBackIosNewIcon />
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopAgents.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopAgents;
