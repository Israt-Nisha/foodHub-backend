type IOptions = {
    page?: number | string;
    limit?: number | string;
    sortOrder?: string;
    sortBy?: string;
}

type IOptionsResult = {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: SortOrder;
}

type SortOrder = "asc" | "desc";

const paginationSortingHelper = (options: IOptions): IOptionsResult => {
    const page: number = Number(options.page) || 1;
    const limit: number = Number(options.limit) || 10;
    const skip = (page - 1) * limit

    const sortBy: string = options.sortBy || "createdAt";
    const sortOrder: SortOrder =
        options.sortOrder === "asc" || options.sortOrder === "desc"
            ? options.sortOrder
            : "desc";
    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder
    }
}

export default paginationSortingHelper;