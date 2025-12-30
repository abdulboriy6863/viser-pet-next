import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberProducts
			memberBlogPosts
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        PRODUCT        *
 *************************/

export const UPDATE_PRODUCT_BY_ADMIN = gql`
	mutation UpdateProductByAdmin($input: ProductUpdate!) {
		updateProductByAdmin(input: $input) {
			_id
			productCollection
			productStatus
			productName
			productDetail
			productPrice
			productDiscount
			productLeftCount
			productSoldCount
			productViews
			productLikes
			productComments
			productRank
			productImages
			productDesc
			memberId
			createdAt
			soldAt
			deletedAt
			updatedAt
		}
	}
`;

export const REMOVE_PRODUCT_BY_ADMIN = gql`
	mutation RemoveProductByAdmin($input: String!) {
		removeProductByAdmin(productId: $input) {
			_id
			productCollection
			productStatus
			productName
			productDetail
			productPrice
			productDiscount
			productLeftCount
			productSoldCount
			productViews
			productLikes
			productComments
			productRank
			productImages
			productDesc
			memberId
			createdAt
			soldAt
			deletedAt
			updatedAt
		}
	}
`;

/**************************
 *      BLOG-POST     *
 *************************/

export const UPDATE_BLOG_POST_BY_ADMIN = gql`
	mutation UpdateBlogPostByAdmin($input: BlogPostUpdate!) {
		updateBlogPostByAdmin(input: $input) {
			_id
			blogPostCategory
			blogPostStatus
			blogPostTitle
			blogPostContent
			blogPostImage
			blogPostViews
			blogPostLikes
			blogPostComments
			blogPostRank
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_BLOG_POST_BY_ADMIN = gql`
	mutation RemoveBlogPostByAdmin($input: String!) {
		removeBlogPostByAdmin(blogPostId: $input) {
			_id
			blogPostCategory
			blogPostStatus
			blogPostTitle
			blogPostContent
			blogPostImage
			blogPostViews
			blogPostLikes
			blogPostComments
			blogPostRank
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *        PROPERTY        *
 *************************/

export const UPDATE_PROPERTY_BY_ADMIN = gql`
	mutation UpdatePropertyByAdmin($input: PropertyUpdate!) {
		updatePropertyByAdmin(input: $input) {
			_id
			propertyType
			propertyStatus
			propertyLocation
			propertyAddress
			propertyTitle
			propertyPrice
			propertySquare
			propertyBeds
			propertyRooms
			propertyViews
			propertyLikes
			propertyImages
			propertyDesc
			propertyBarter
			propertyRent
			memberId
			soldAt
			deletedAt
			constructedAt
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_PROPERTY_BY_ADMIN = gql`
	mutation RemovePropertyByAdmin($input: String!) {
		removePropertyByAdmin(propertyId: $input) {
			_id
			propertyType
			propertyStatus
			propertyLocation
			propertyAddress
			propertyTitle
			propertyPrice
			propertySquare
			propertyBeds
			propertyRooms
			propertyViews
			propertyLikes
			propertyImages
			propertyDesc
			propertyBarter
			propertyRent
			memberId
			soldAt
			deletedAt
			constructedAt
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

// export const REMOVE_COMMENT_BY_ADMIN = gql`
// 	mutation RemoveCommentByAdmin($input: String!) {
// 		removeCommentByAdmin(commentId: $input) {
// 			_id
// 			commentStatus
// 			commentGroup
// 			commentContent
// 			commentRefId
// 			memberId
// 			createdAt
// 			updatedAt
// 		}
// 	}
// `;
