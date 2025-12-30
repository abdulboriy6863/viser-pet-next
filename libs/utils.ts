import numeral from 'numeral';
import { sweetMixinErrorAlert } from './sweetAlert';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

export const likeTargetProductHandler = async (likeTargetProduct: any, id: string) => {
	try {
		await likeTargetProduct({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetProductHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetblogPostHandler = async (likeTargetBlogPost: any, id: string) => {
	try {
		await likeTargetBlogPost({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetblogPostHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string) => {
	try {
		await likeTargetMember({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetMemberHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

//o'zgartirdim
