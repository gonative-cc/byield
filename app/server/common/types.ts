export interface GraphQLResponse<T> {
	data: T;
	errors?: Array<{ message: string }>;
}
