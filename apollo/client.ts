import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { error } from 'console';
import { petStatsVar, socketVar } from './store';
let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	//bu yerda token ni olyapmiz va
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}
// @ts-ignore
const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		return true;
	}, // @ts-ignore
	fetchAccessToken: () => {
		// execute refresh token
		return null;
	},
}); //REFRESH TOKEN BILAN AUTH NI QURISH KERAK

//custom websocket client
class LoggingWebSocket {
	private socket: WebSocket;

	constructor(url: string) {
		this.socket = new WebSocket(`${url}?token=${getJwtToken()}`);
		socketVar(this.socket);

		this.socket.onopen = () => {
			console.log('WebSocket connection');
		};

		// this.socket.onmessage = (msg) => {
		// 	console.log('WebSocket message', msg.data);
		// };

		this.socket.onmessage = (msg) => {
			console.log('WebSocket message', msg.data);

			try {
				const parsed = JSON.parse(msg.data as string);

				if (parsed?.event === 'petStats:krCities' && Array.isArray(parsed?.rows)) {
					petStatsVar(parsed.rows);
				}
			} catch {}
		};

		this.socket.onerror = (error) => {
			console.log('WebSocket error', error);
		};
	}

	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
		this.socket.send(data);
	}

	close() {
		this.socket.close();
	}
}

function createIsomorphicLink() {
	// va shu yerga token ni tiqib qoyyapmiz
	if (typeof window !== 'undefined') {
		//bu yerda authentication link hosil bolgan
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers, // bu yerda token ni headers ni ichib tiqib qoyyapmiz BEARER TOKEN
					...getHeaders(),
				},
			}));
			console.warn('requesting.. ', operation);
			return forward(operation);
		}); // buni qilishimizdan asosiy maqsad backend timizga kim req qilayotkanini tushuntirish

		// @ts-ignore
		const link = new createUploadLink({
			uri: process.env.REACT_APP_API_GRAPHQL_URL, //bu yerda graphql link ki hosil bolgan
		});

		/* WEBSOCKET SUBSCRIPTION LINK */
		const wsLink = new WebSocketLink({
			//bu yerda esa websocket bilan ulanish uchun link hosil bolgan
			uri: process.env.REACT_APP_API_WS ?? 'ws://127.0.0.1:3007',
			options: {
				reconnect: false,
				timeout: 30000,
				connectionParams: () => {
					return { headers: getHeaders() };
				},
			},
			webSocketImpl: LoggingWebSocket,
		});

		const errorLink = onError(({ graphQLErrors, networkError, response }) => {
			//bu yerda error bolgan holatdagi narsalarni handle qilish uchun hosil bolgan
			if (graphQLErrors) {
				graphQLErrors.map(({ message, locations, path, extensions }) => {
					console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
					if (!message.includes('input')) sweetErrorAlert(message);
				});
			}
			if (networkError) console.log(`[Network error]: ${networkError}`);
			// @ts-ignore
			if (networkError?.statusCode === 401) {
			}
		});

		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			wsLink, //hammasi yegilib shu yerga joylashyapti
			authLink.concat(link),
		);

		return from([errorLink, tokenRefreshLink, splitLink]); //hamda uni return qilib yubordik
	}
}

function createApolloClient() {
	// createApolloClient  bu appolloClientni quradi
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(), //bu yerda cache ni ajratadi
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	// agarda apolloClient bolsa ozini berib yuboradi yoq bosa createApolloClient ni ishga tushuradi
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	// useApollo bizga initializeApollo ni ishga tushurib beradi
	return useMemo(() => initializeApollo(initialState), [initialState]);
} // useMemo bu (useState) bilan bir xil narsa faqat bu keyingi malumot kelguncha valueni cashelaydi

/**
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// No Subscription required for develop process

const httpLink = createHttpLink({
  uri: "http://localhost:3007/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
*/

//TOKEN LAR BILAN AUTH QURAYOTKANDA HICHQACHON ACCESS TOKEN NI OZI BILAN AUTH QURILMAYDI
//ACCESS TOKEN VS REFRESH TOKEN

//biz serverga 3 xil yol bian req jonatishimiz mumkun
// 1. react query (98%) useMutation() & useQuery() (TSX)
// 2. apollo client obj (1%) (TS FILE)
// 3. axios (1%) (FILE rasm)
