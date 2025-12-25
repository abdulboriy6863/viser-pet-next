import {
	BlogPostCategory,
	BlogPostStatus,
	BoardArticleCategory,
	BoardArticleStatus,
} from '../../enums/board-article.enum';
import { Member } from '../member/member';
import { MeLiked, TotalCounter } from '../property/property';

export interface BoardArticle {
	_id: string;
	articleCategory: BoardArticleCategory;
	articleStatus: BoardArticleStatus;
	articleTitle: string;
	articleContent: string;
	articleImage: string;
	articleViews: number;
	articleLikes: number;
	articleComments: number;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface BoardArticles {
	list: BoardArticle[];
	metaCounter: TotalCounter[];
}

export interface BlogPost {
	_id: string;
	blogPostCategory: BlogPostCategory;
	blogPostStatus: BlogPostStatus;
	blogPostTitle: string;
	blogPostContent: string;
	blogPostImage: string;
	blogPostViews: number;
	blogPostLikes: number;
	blogPostComments: number;
	blogPostRank: number;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface BlogPosts {
	list: BlogPost[];
	metaCounter: TotalCounter[];
}
