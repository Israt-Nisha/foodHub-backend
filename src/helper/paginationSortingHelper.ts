type IOptions = {
  page?: number | string;
  limit?: number | string;
  sortOrder?: string;
  sortBy?: string;
};

type SortOrder = "asc" | "desc";

type IOptionsResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: "createdAt" | "price" | "name"; 
  sortOrder: SortOrder;
};

const allowedSortFields = ["createdAt", "price", "name"] as const;

const paginationSortingHelper = (options: IOptions): IOptionsResult => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const sortOrder: SortOrder =
    options.sortOrder === "asc" || options.sortOrder === "desc"
      ? options.sortOrder
      : "desc";

  const sortBy = allowedSortFields.includes(options.sortBy as any)
    ? (options.sortBy as IOptionsResult["sortBy"])
    : "createdAt";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export default paginationSortingHelper;
