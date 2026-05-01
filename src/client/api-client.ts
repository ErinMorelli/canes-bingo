type SomeOf<T> = T[keyof T];

/** post /api/v1/login */
type PostApiV1LoginInput = {
    username: string;
    password: string;
};

/** post /api/v1/login */
type PostApiV1LoginPositiveVariant1 = {
    status: "success";
    data: {
        userId: number;
        username: string;
    };
};

/** post /api/v1/login */
interface PostApiV1LoginPositiveResponseVariants {
    200: PostApiV1LoginPositiveVariant1;
}

/** post /api/v1/login */
type PostApiV1LoginNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** post /api/v1/login */
interface PostApiV1LoginNegativeResponseVariants {
    400: PostApiV1LoginNegativeVariant1;
}

/** post /api/v1/logout */
type PostApiV1LogoutInput = {};

/** post /api/v1/logout */
type PostApiV1LogoutPositiveVariant1 = {
    status: "success";
    data: {};
};

/** post /api/v1/logout */
interface PostApiV1LogoutPositiveResponseVariants {
    200: PostApiV1LogoutPositiveVariant1;
}

/** post /api/v1/logout */
type PostApiV1LogoutNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** post /api/v1/logout */
interface PostApiV1LogoutNegativeResponseVariants {
    400: PostApiV1LogoutNegativeVariant1;
}

/** get /api/v1/session */
type GetApiV1SessionInput = {};

/** get /api/v1/session */
type GetApiV1SessionPositiveVariant1 = {
    status: "success";
    data: {
        userId: number;
        username: string;
    };
};

/** get /api/v1/session */
interface GetApiV1SessionPositiveResponseVariants {
    200: GetApiV1SessionPositiveVariant1;
}

/** get /api/v1/session */
type GetApiV1SessionNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/session */
interface GetApiV1SessionNegativeResponseVariants {
    400: GetApiV1SessionNegativeVariant1;
}

/** head /api/v1/session */
type HeadApiV1SessionInput = {};

/** head /api/v1/session */
type HeadApiV1SessionPositiveVariant1 = undefined;

/** head /api/v1/session */
interface HeadApiV1SessionPositiveResponseVariants {
    200: HeadApiV1SessionPositiveVariant1;
}

/** head /api/v1/session */
type HeadApiV1SessionNegativeVariant1 = undefined;

/** head /api/v1/session */
interface HeadApiV1SessionNegativeResponseVariants {
    400: HeadApiV1SessionNegativeVariant1;
}

/** get /api/v1/users */
type GetApiV1UsersInput = {};

/** get /api/v1/users */
type GetApiV1UsersPositiveVariant1 = {
    status: "success";
    data: {
        items: {
            id: number;
            username: string;
        }[];
    };
};

/** get /api/v1/users */
interface GetApiV1UsersPositiveResponseVariants {
    200: GetApiV1UsersPositiveVariant1;
}

/** get /api/v1/users */
type GetApiV1UsersNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/users */
interface GetApiV1UsersNegativeResponseVariants {
    400: GetApiV1UsersNegativeVariant1;
}

/** head /api/v1/users */
type HeadApiV1UsersInput = {};

/** head /api/v1/users */
type HeadApiV1UsersPositiveVariant1 = undefined;

/** head /api/v1/users */
interface HeadApiV1UsersPositiveResponseVariants {
    200: HeadApiV1UsersPositiveVariant1;
}

/** head /api/v1/users */
type HeadApiV1UsersNegativeVariant1 = undefined;

/** head /api/v1/users */
interface HeadApiV1UsersNegativeResponseVariants {
    400: HeadApiV1UsersNegativeVariant1;
}

/** post /api/v1/users */
type PostApiV1UsersInput = {
    username: string;
    password: string;
};

/** post /api/v1/users */
type PostApiV1UsersPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        username: string;
    };
};

/** post /api/v1/users */
interface PostApiV1UsersPositiveResponseVariants {
    200: PostApiV1UsersPositiveVariant1;
}

/** post /api/v1/users */
type PostApiV1UsersNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** post /api/v1/users */
interface PostApiV1UsersNegativeResponseVariants {
    400: PostApiV1UsersNegativeVariant1;
}

/** get /api/v1/users/:userId */
type GetApiV1UsersUserIdInput = {
    userId: string;
};

/** get /api/v1/users/:userId */
type GetApiV1UsersUserIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        username: string;
    };
};

/** get /api/v1/users/:userId */
interface GetApiV1UsersUserIdPositiveResponseVariants {
    200: GetApiV1UsersUserIdPositiveVariant1;
}

/** get /api/v1/users/:userId */
type GetApiV1UsersUserIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/users/:userId */
interface GetApiV1UsersUserIdNegativeResponseVariants {
    400: GetApiV1UsersUserIdNegativeVariant1;
}

/** head /api/v1/users/:userId */
type HeadApiV1UsersUserIdInput = {
    userId: string;
};

/** head /api/v1/users/:userId */
type HeadApiV1UsersUserIdPositiveVariant1 = undefined;

/** head /api/v1/users/:userId */
interface HeadApiV1UsersUserIdPositiveResponseVariants {
    200: HeadApiV1UsersUserIdPositiveVariant1;
}

/** head /api/v1/users/:userId */
type HeadApiV1UsersUserIdNegativeVariant1 = undefined;

/** head /api/v1/users/:userId */
interface HeadApiV1UsersUserIdNegativeResponseVariants {
    400: HeadApiV1UsersUserIdNegativeVariant1;
}

/** put /api/v1/users/:userId */
type PutApiV1UsersUserIdInput = {
    userId: string;
    username: string;
    password?: string | undefined;
};

/** put /api/v1/users/:userId */
type PutApiV1UsersUserIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        username: string;
    };
};

/** put /api/v1/users/:userId */
interface PutApiV1UsersUserIdPositiveResponseVariants {
    200: PutApiV1UsersUserIdPositiveVariant1;
}

/** put /api/v1/users/:userId */
type PutApiV1UsersUserIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** put /api/v1/users/:userId */
interface PutApiV1UsersUserIdNegativeResponseVariants {
    400: PutApiV1UsersUserIdNegativeVariant1;
}

/** delete /api/v1/users/:userId */
type DeleteApiV1UsersUserIdInput = {
    userId: string;
};

/** delete /api/v1/users/:userId */
type DeleteApiV1UsersUserIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        username: string;
    };
};

/** delete /api/v1/users/:userId */
interface DeleteApiV1UsersUserIdPositiveResponseVariants {
    200: DeleteApiV1UsersUserIdPositiveVariant1;
}

/** delete /api/v1/users/:userId */
type DeleteApiV1UsersUserIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** delete /api/v1/users/:userId */
interface DeleteApiV1UsersUserIdNegativeResponseVariants {
    400: DeleteApiV1UsersUserIdNegativeVariant1;
}

/** get /api/v1/games */
type GetApiV1GamesInput = {};

/** get /api/v1/games */
type GetApiV1GamesPositiveVariant1 = {
    status: "success";
    data: {
        items: {
            id: number;
            name: string;
            description: string | null;
            isDefault: boolean;
            patterns: {
                id: number;
                name: string;
                squares: {
                    col: number;
                    row: number;
                }[];
            }[];
        }[];
    };
};

/** get /api/v1/games */
interface GetApiV1GamesPositiveResponseVariants {
    200: GetApiV1GamesPositiveVariant1;
}

/** get /api/v1/games */
type GetApiV1GamesNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/games */
interface GetApiV1GamesNegativeResponseVariants {
    400: GetApiV1GamesNegativeVariant1;
}

/** head /api/v1/games */
type HeadApiV1GamesInput = {};

/** head /api/v1/games */
type HeadApiV1GamesPositiveVariant1 = undefined;

/** head /api/v1/games */
interface HeadApiV1GamesPositiveResponseVariants {
    200: HeadApiV1GamesPositiveVariant1;
}

/** head /api/v1/games */
type HeadApiV1GamesNegativeVariant1 = undefined;

/** head /api/v1/games */
interface HeadApiV1GamesNegativeResponseVariants {
    400: HeadApiV1GamesNegativeVariant1;
}

/** post /api/v1/games */
type PostApiV1GamesInput = {
    name: string;
    description?: string | undefined;
    isDefault?: boolean | undefined;
    patterns?: number[] | undefined;
};

/** post /api/v1/games */
type PostApiV1GamesPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        description: string | null;
        isDefault: boolean;
        patterns: {
            id: number;
            name: string;
            squares: {
                col: number;
                row: number;
            }[];
        }[];
    };
};

/** post /api/v1/games */
interface PostApiV1GamesPositiveResponseVariants {
    200: PostApiV1GamesPositiveVariant1;
}

/** post /api/v1/games */
type PostApiV1GamesNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** post /api/v1/games */
interface PostApiV1GamesNegativeResponseVariants {
    400: PostApiV1GamesNegativeVariant1;
}

/** get /api/v1/games/:gameId */
type GetApiV1GamesGameIdInput = {
    gameId: string;
};

/** get /api/v1/games/:gameId */
type GetApiV1GamesGameIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        description: string | null;
        isDefault: boolean;
        patterns: {
            id: number;
            name: string;
            squares: {
                col: number;
                row: number;
            }[];
        }[];
    };
};

/** get /api/v1/games/:gameId */
interface GetApiV1GamesGameIdPositiveResponseVariants {
    200: GetApiV1GamesGameIdPositiveVariant1;
}

/** get /api/v1/games/:gameId */
type GetApiV1GamesGameIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/games/:gameId */
interface GetApiV1GamesGameIdNegativeResponseVariants {
    400: GetApiV1GamesGameIdNegativeVariant1;
}

/** head /api/v1/games/:gameId */
type HeadApiV1GamesGameIdInput = {
    gameId: string;
};

/** head /api/v1/games/:gameId */
type HeadApiV1GamesGameIdPositiveVariant1 = undefined;

/** head /api/v1/games/:gameId */
interface HeadApiV1GamesGameIdPositiveResponseVariants {
    200: HeadApiV1GamesGameIdPositiveVariant1;
}

/** head /api/v1/games/:gameId */
type HeadApiV1GamesGameIdNegativeVariant1 = undefined;

/** head /api/v1/games/:gameId */
interface HeadApiV1GamesGameIdNegativeResponseVariants {
    400: HeadApiV1GamesGameIdNegativeVariant1;
}

/** put /api/v1/games/:gameId */
type PutApiV1GamesGameIdInput = {
    gameId: string;
    name: string;
    description?: string | undefined;
    isDefault?: boolean | undefined;
    patterns?: {
        added?: number[] | undefined;
        removed?: number[] | undefined;
    } | undefined;
};

/** put /api/v1/games/:gameId */
type PutApiV1GamesGameIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        description: string | null;
        isDefault: boolean;
        patterns: {
            id: number;
            name: string;
            squares: {
                col: number;
                row: number;
            }[];
        }[];
    };
};

/** put /api/v1/games/:gameId */
interface PutApiV1GamesGameIdPositiveResponseVariants {
    200: PutApiV1GamesGameIdPositiveVariant1;
}

/** put /api/v1/games/:gameId */
type PutApiV1GamesGameIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** put /api/v1/games/:gameId */
interface PutApiV1GamesGameIdNegativeResponseVariants {
    400: PutApiV1GamesGameIdNegativeVariant1;
}

/** delete /api/v1/games/:gameId */
type DeleteApiV1GamesGameIdInput = {
    gameId: string;
};

/** delete /api/v1/games/:gameId */
type DeleteApiV1GamesGameIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        description: string | null;
        isDefault: boolean;
        patterns: {
            id: number;
            name: string;
            squares: {
                col: number;
                row: number;
            }[];
        }[];
    };
};

/** delete /api/v1/games/:gameId */
interface DeleteApiV1GamesGameIdPositiveResponseVariants {
    200: DeleteApiV1GamesGameIdPositiveVariant1;
}

/** delete /api/v1/games/:gameId */
type DeleteApiV1GamesGameIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** delete /api/v1/games/:gameId */
interface DeleteApiV1GamesGameIdNegativeResponseVariants {
    400: DeleteApiV1GamesGameIdNegativeVariant1;
}

/** get /api/v1/groups */
type GetApiV1GroupsInput = {};

/** get /api/v1/groups */
type GetApiV1GroupsPositiveVariant1 = {
    status: "success";
    data: {
        items: {
            id: number;
            name: string;
            label: string;
            description: string | null;
            categories?: {
                id: number;
                name: string;
                label: string;
                description: string | null;
                isDefault: boolean;
            }[] | undefined;
        }[];
    };
};

/** get /api/v1/groups */
interface GetApiV1GroupsPositiveResponseVariants {
    200: GetApiV1GroupsPositiveVariant1;
}

/** get /api/v1/groups */
type GetApiV1GroupsNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/groups */
interface GetApiV1GroupsNegativeResponseVariants {
    400: GetApiV1GroupsNegativeVariant1;
}

/** head /api/v1/groups */
type HeadApiV1GroupsInput = {};

/** head /api/v1/groups */
type HeadApiV1GroupsPositiveVariant1 = undefined;

/** head /api/v1/groups */
interface HeadApiV1GroupsPositiveResponseVariants {
    200: HeadApiV1GroupsPositiveVariant1;
}

/** head /api/v1/groups */
type HeadApiV1GroupsNegativeVariant1 = undefined;

/** head /api/v1/groups */
interface HeadApiV1GroupsNegativeResponseVariants {
    400: HeadApiV1GroupsNegativeVariant1;
}

/** post /api/v1/groups */
type PostApiV1GroupsInput = {
    name: string;
    label: string;
    description?: string | undefined;
};

/** post /api/v1/groups */
type PostApiV1GroupsPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        label: string;
        description: string | null;
        categories?: {
            id: number;
            name: string;
            label: string;
            description: string | null;
            isDefault: boolean;
        }[] | undefined;
    };
};

/** post /api/v1/groups */
interface PostApiV1GroupsPositiveResponseVariants {
    200: PostApiV1GroupsPositiveVariant1;
}

/** post /api/v1/groups */
type PostApiV1GroupsNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** post /api/v1/groups */
interface PostApiV1GroupsNegativeResponseVariants {
    400: PostApiV1GroupsNegativeVariant1;
}

/** get /api/v1/groups/:groupId */
type GetApiV1GroupsGroupIdInput = {
    groupId: string;
};

/** get /api/v1/groups/:groupId */
type GetApiV1GroupsGroupIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        label: string;
        description: string | null;
        categories?: {
            id: number;
            name: string;
            label: string;
            description: string | null;
            isDefault: boolean;
        }[] | undefined;
    };
};

/** get /api/v1/groups/:groupId */
interface GetApiV1GroupsGroupIdPositiveResponseVariants {
    200: GetApiV1GroupsGroupIdPositiveVariant1;
}

/** get /api/v1/groups/:groupId */
type GetApiV1GroupsGroupIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/groups/:groupId */
interface GetApiV1GroupsGroupIdNegativeResponseVariants {
    400: GetApiV1GroupsGroupIdNegativeVariant1;
}

/** head /api/v1/groups/:groupId */
type HeadApiV1GroupsGroupIdInput = {
    groupId: string;
};

/** head /api/v1/groups/:groupId */
type HeadApiV1GroupsGroupIdPositiveVariant1 = undefined;

/** head /api/v1/groups/:groupId */
interface HeadApiV1GroupsGroupIdPositiveResponseVariants {
    200: HeadApiV1GroupsGroupIdPositiveVariant1;
}

/** head /api/v1/groups/:groupId */
type HeadApiV1GroupsGroupIdNegativeVariant1 = undefined;

/** head /api/v1/groups/:groupId */
interface HeadApiV1GroupsGroupIdNegativeResponseVariants {
    400: HeadApiV1GroupsGroupIdNegativeVariant1;
}

/** put /api/v1/groups/:groupId */
type PutApiV1GroupsGroupIdInput = {
    groupId: string;
    name: string;
    label: string;
    description?: string | undefined;
};

/** put /api/v1/groups/:groupId */
type PutApiV1GroupsGroupIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        label: string;
        description: string | null;
        categories?: {
            id: number;
            name: string;
            label: string;
            description: string | null;
            isDefault: boolean;
        }[] | undefined;
    };
};

/** put /api/v1/groups/:groupId */
interface PutApiV1GroupsGroupIdPositiveResponseVariants {
    200: PutApiV1GroupsGroupIdPositiveVariant1;
}

/** put /api/v1/groups/:groupId */
type PutApiV1GroupsGroupIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** put /api/v1/groups/:groupId */
interface PutApiV1GroupsGroupIdNegativeResponseVariants {
    400: PutApiV1GroupsGroupIdNegativeVariant1;
}

/** delete /api/v1/groups/:groupId */
type DeleteApiV1GroupsGroupIdInput = {
    groupId: string;
};

/** delete /api/v1/groups/:groupId */
type DeleteApiV1GroupsGroupIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        label: string;
        description: string | null;
        categories?: {
            id: number;
            name: string;
            label: string;
            description: string | null;
            isDefault: boolean;
        }[] | undefined;
    };
};

/** delete /api/v1/groups/:groupId */
interface DeleteApiV1GroupsGroupIdPositiveResponseVariants {
    200: DeleteApiV1GroupsGroupIdPositiveVariant1;
}

/** delete /api/v1/groups/:groupId */
type DeleteApiV1GroupsGroupIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** delete /api/v1/groups/:groupId */
interface DeleteApiV1GroupsGroupIdNegativeResponseVariants {
    400: DeleteApiV1GroupsGroupIdNegativeVariant1;
}

/** get /api/v1/categories */
type GetApiV1CategoriesInput = {
    group_id?: string | undefined;
};

/** get /api/v1/categories */
type GetApiV1CategoriesPositiveVariant1 = {
    status: "success";
    data: {
        items: {
            id: number;
            name: string;
            label: string;
            description: string | null;
            isDefault: boolean;
            groupId: number | null;
        }[];
    };
};

/** get /api/v1/categories */
interface GetApiV1CategoriesPositiveResponseVariants {
    200: GetApiV1CategoriesPositiveVariant1;
}

/** get /api/v1/categories */
type GetApiV1CategoriesNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/categories */
interface GetApiV1CategoriesNegativeResponseVariants {
    400: GetApiV1CategoriesNegativeVariant1;
}

/** head /api/v1/categories */
type HeadApiV1CategoriesInput = {
    group_id?: string | undefined;
};

/** head /api/v1/categories */
type HeadApiV1CategoriesPositiveVariant1 = undefined;

/** head /api/v1/categories */
interface HeadApiV1CategoriesPositiveResponseVariants {
    200: HeadApiV1CategoriesPositiveVariant1;
}

/** head /api/v1/categories */
type HeadApiV1CategoriesNegativeVariant1 = undefined;

/** head /api/v1/categories */
interface HeadApiV1CategoriesNegativeResponseVariants {
    400: HeadApiV1CategoriesNegativeVariant1;
}

/** post /api/v1/categories */
type PostApiV1CategoriesInput = {
    name: string;
    label: string;
    description?: string | undefined;
    groupId?: number | undefined;
    isDefault?: boolean | undefined;
};

/** post /api/v1/categories */
type PostApiV1CategoriesPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        label: string;
        description: string | null;
        isDefault: boolean;
        groupId: number | null;
    };
};

/** post /api/v1/categories */
interface PostApiV1CategoriesPositiveResponseVariants {
    200: PostApiV1CategoriesPositiveVariant1;
}

/** post /api/v1/categories */
type PostApiV1CategoriesNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** post /api/v1/categories */
interface PostApiV1CategoriesNegativeResponseVariants {
    400: PostApiV1CategoriesNegativeVariant1;
}

/** get /api/v1/categories/:categoryId */
type GetApiV1CategoriesCategoryIdInput = {
    categoryId: string;
};

/** get /api/v1/categories/:categoryId */
type GetApiV1CategoriesCategoryIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        label: string;
        description: string | null;
        isDefault: boolean;
        groupId: number | null;
    };
};

/** get /api/v1/categories/:categoryId */
interface GetApiV1CategoriesCategoryIdPositiveResponseVariants {
    200: GetApiV1CategoriesCategoryIdPositiveVariant1;
}

/** get /api/v1/categories/:categoryId */
type GetApiV1CategoriesCategoryIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/categories/:categoryId */
interface GetApiV1CategoriesCategoryIdNegativeResponseVariants {
    400: GetApiV1CategoriesCategoryIdNegativeVariant1;
}

/** head /api/v1/categories/:categoryId */
type HeadApiV1CategoriesCategoryIdInput = {
    categoryId: string;
};

/** head /api/v1/categories/:categoryId */
type HeadApiV1CategoriesCategoryIdPositiveVariant1 = undefined;

/** head /api/v1/categories/:categoryId */
interface HeadApiV1CategoriesCategoryIdPositiveResponseVariants {
    200: HeadApiV1CategoriesCategoryIdPositiveVariant1;
}

/** head /api/v1/categories/:categoryId */
type HeadApiV1CategoriesCategoryIdNegativeVariant1 = undefined;

/** head /api/v1/categories/:categoryId */
interface HeadApiV1CategoriesCategoryIdNegativeResponseVariants {
    400: HeadApiV1CategoriesCategoryIdNegativeVariant1;
}

/** put /api/v1/categories/:categoryId */
type PutApiV1CategoriesCategoryIdInput = {
    categoryId: string;
    name: string;
    label: string;
    description?: string | undefined;
    groupId?: number | undefined;
    isDefault?: boolean | undefined;
};

/** put /api/v1/categories/:categoryId */
type PutApiV1CategoriesCategoryIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        label: string;
        description: string | null;
        isDefault: boolean;
        groupId: number | null;
    };
};

/** put /api/v1/categories/:categoryId */
interface PutApiV1CategoriesCategoryIdPositiveResponseVariants {
    200: PutApiV1CategoriesCategoryIdPositiveVariant1;
}

/** put /api/v1/categories/:categoryId */
type PutApiV1CategoriesCategoryIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** put /api/v1/categories/:categoryId */
interface PutApiV1CategoriesCategoryIdNegativeResponseVariants {
    400: PutApiV1CategoriesCategoryIdNegativeVariant1;
}

/** delete /api/v1/categories/:categoryId */
type DeleteApiV1CategoriesCategoryIdInput = {
    categoryId: string;
};

/** delete /api/v1/categories/:categoryId */
type DeleteApiV1CategoriesCategoryIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        label: string;
        description: string | null;
        isDefault: boolean;
        groupId: number | null;
    };
};

/** delete /api/v1/categories/:categoryId */
interface DeleteApiV1CategoriesCategoryIdPositiveResponseVariants {
    200: DeleteApiV1CategoriesCategoryIdPositiveVariant1;
}

/** delete /api/v1/categories/:categoryId */
type DeleteApiV1CategoriesCategoryIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** delete /api/v1/categories/:categoryId */
interface DeleteApiV1CategoriesCategoryIdNegativeResponseVariants {
    400: DeleteApiV1CategoriesCategoryIdNegativeVariant1;
}

/** get /api/v1/patterns */
type GetApiV1PatternsInput = {};

/** get /api/v1/patterns */
type GetApiV1PatternsPositiveVariant1 = {
    status: "success";
    data: {
        items: {
            id: number;
            name: string;
            squares: {
                col: number;
                row: number;
            }[];
        }[];
    };
};

/** get /api/v1/patterns */
interface GetApiV1PatternsPositiveResponseVariants {
    200: GetApiV1PatternsPositiveVariant1;
}

/** get /api/v1/patterns */
type GetApiV1PatternsNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/patterns */
interface GetApiV1PatternsNegativeResponseVariants {
    400: GetApiV1PatternsNegativeVariant1;
}

/** head /api/v1/patterns */
type HeadApiV1PatternsInput = {};

/** head /api/v1/patterns */
type HeadApiV1PatternsPositiveVariant1 = undefined;

/** head /api/v1/patterns */
interface HeadApiV1PatternsPositiveResponseVariants {
    200: HeadApiV1PatternsPositiveVariant1;
}

/** head /api/v1/patterns */
type HeadApiV1PatternsNegativeVariant1 = undefined;

/** head /api/v1/patterns */
interface HeadApiV1PatternsNegativeResponseVariants {
    400: HeadApiV1PatternsNegativeVariant1;
}

/** post /api/v1/patterns */
type PostApiV1PatternsInput = {
    name: string;
    squares: string;
};

/** post /api/v1/patterns */
type PostApiV1PatternsPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        squares: {
            col: number;
            row: number;
        }[];
    };
};

/** post /api/v1/patterns */
interface PostApiV1PatternsPositiveResponseVariants {
    200: PostApiV1PatternsPositiveVariant1;
}

/** post /api/v1/patterns */
type PostApiV1PatternsNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** post /api/v1/patterns */
interface PostApiV1PatternsNegativeResponseVariants {
    400: PostApiV1PatternsNegativeVariant1;
}

/** get /api/v1/patterns/:patternId */
type GetApiV1PatternsPatternIdInput = {
    patternId: string;
};

/** get /api/v1/patterns/:patternId */
type GetApiV1PatternsPatternIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        squares: {
            col: number;
            row: number;
        }[];
    };
};

/** get /api/v1/patterns/:patternId */
interface GetApiV1PatternsPatternIdPositiveResponseVariants {
    200: GetApiV1PatternsPatternIdPositiveVariant1;
}

/** get /api/v1/patterns/:patternId */
type GetApiV1PatternsPatternIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/patterns/:patternId */
interface GetApiV1PatternsPatternIdNegativeResponseVariants {
    400: GetApiV1PatternsPatternIdNegativeVariant1;
}

/** head /api/v1/patterns/:patternId */
type HeadApiV1PatternsPatternIdInput = {
    patternId: string;
};

/** head /api/v1/patterns/:patternId */
type HeadApiV1PatternsPatternIdPositiveVariant1 = undefined;

/** head /api/v1/patterns/:patternId */
interface HeadApiV1PatternsPatternIdPositiveResponseVariants {
    200: HeadApiV1PatternsPatternIdPositiveVariant1;
}

/** head /api/v1/patterns/:patternId */
type HeadApiV1PatternsPatternIdNegativeVariant1 = undefined;

/** head /api/v1/patterns/:patternId */
interface HeadApiV1PatternsPatternIdNegativeResponseVariants {
    400: HeadApiV1PatternsPatternIdNegativeVariant1;
}

/** put /api/v1/patterns/:patternId */
type PutApiV1PatternsPatternIdInput = {
    patternId: string;
    name: string;
    squares: string;
};

/** put /api/v1/patterns/:patternId */
type PutApiV1PatternsPatternIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        squares: {
            col: number;
            row: number;
        }[];
    };
};

/** put /api/v1/patterns/:patternId */
interface PutApiV1PatternsPatternIdPositiveResponseVariants {
    200: PutApiV1PatternsPatternIdPositiveVariant1;
}

/** put /api/v1/patterns/:patternId */
type PutApiV1PatternsPatternIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** put /api/v1/patterns/:patternId */
interface PutApiV1PatternsPatternIdNegativeResponseVariants {
    400: PutApiV1PatternsPatternIdNegativeVariant1;
}

/** delete /api/v1/patterns/:patternId */
type DeleteApiV1PatternsPatternIdInput = {
    patternId: string;
};

/** delete /api/v1/patterns/:patternId */
type DeleteApiV1PatternsPatternIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        name: string;
        squares: {
            col: number;
            row: number;
        }[];
    };
};

/** delete /api/v1/patterns/:patternId */
interface DeleteApiV1PatternsPatternIdPositiveResponseVariants {
    200: DeleteApiV1PatternsPatternIdPositiveVariant1;
}

/** delete /api/v1/patterns/:patternId */
type DeleteApiV1PatternsPatternIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** delete /api/v1/patterns/:patternId */
interface DeleteApiV1PatternsPatternIdNegativeResponseVariants {
    400: DeleteApiV1PatternsPatternIdNegativeVariant1;
}

/** get /api/v1/squares */
type GetApiV1SquaresInput = {
    exclude?: string | undefined;
    include?: string | undefined;
    category_id?: string | undefined;
};

/** get /api/v1/squares */
type GetApiV1SquaresPositiveVariant1 = {
    status: "success";
    data: {
        items: {
            id: number;
            value: string;
            description: string | null;
            active: boolean;
            categories: string | null;
        }[];
    };
};

/** get /api/v1/squares */
interface GetApiV1SquaresPositiveResponseVariants {
    200: GetApiV1SquaresPositiveVariant1;
}

/** get /api/v1/squares */
type GetApiV1SquaresNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/squares */
interface GetApiV1SquaresNegativeResponseVariants {
    400: GetApiV1SquaresNegativeVariant1;
}

/** head /api/v1/squares */
type HeadApiV1SquaresInput = {
    exclude?: string | undefined;
    include?: string | undefined;
    category_id?: string | undefined;
};

/** head /api/v1/squares */
type HeadApiV1SquaresPositiveVariant1 = undefined;

/** head /api/v1/squares */
interface HeadApiV1SquaresPositiveResponseVariants {
    200: HeadApiV1SquaresPositiveVariant1;
}

/** head /api/v1/squares */
type HeadApiV1SquaresNegativeVariant1 = undefined;

/** head /api/v1/squares */
interface HeadApiV1SquaresNegativeResponseVariants {
    400: HeadApiV1SquaresNegativeVariant1;
}

/** post /api/v1/squares */
type PostApiV1SquaresInput = {
    content: string;
    description?: string | undefined;
    active?: boolean | undefined;
    categories?: number[] | undefined;
};

/** post /api/v1/squares */
type PostApiV1SquaresPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        value: string;
        description: string | null;
        active: boolean;
        categories: string | null;
    };
};

/** post /api/v1/squares */
interface PostApiV1SquaresPositiveResponseVariants {
    200: PostApiV1SquaresPositiveVariant1;
}

/** post /api/v1/squares */
type PostApiV1SquaresNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** post /api/v1/squares */
interface PostApiV1SquaresNegativeResponseVariants {
    400: PostApiV1SquaresNegativeVariant1;
}

/** get /api/v1/squares/:squareId */
type GetApiV1SquaresSquareIdInput = {
    squareId: string;
};

/** get /api/v1/squares/:squareId */
type GetApiV1SquaresSquareIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        value: string;
        description: string | null;
        active: boolean;
        categories: string | null;
    };
};

/** get /api/v1/squares/:squareId */
interface GetApiV1SquaresSquareIdPositiveResponseVariants {
    200: GetApiV1SquaresSquareIdPositiveVariant1;
}

/** get /api/v1/squares/:squareId */
type GetApiV1SquaresSquareIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/squares/:squareId */
interface GetApiV1SquaresSquareIdNegativeResponseVariants {
    400: GetApiV1SquaresSquareIdNegativeVariant1;
}

/** head /api/v1/squares/:squareId */
type HeadApiV1SquaresSquareIdInput = {
    squareId: string;
};

/** head /api/v1/squares/:squareId */
type HeadApiV1SquaresSquareIdPositiveVariant1 = undefined;

/** head /api/v1/squares/:squareId */
interface HeadApiV1SquaresSquareIdPositiveResponseVariants {
    200: HeadApiV1SquaresSquareIdPositiveVariant1;
}

/** head /api/v1/squares/:squareId */
type HeadApiV1SquaresSquareIdNegativeVariant1 = undefined;

/** head /api/v1/squares/:squareId */
interface HeadApiV1SquaresSquareIdNegativeResponseVariants {
    400: HeadApiV1SquaresSquareIdNegativeVariant1;
}

/** put /api/v1/squares/:squareId */
type PutApiV1SquaresSquareIdInput = {
    squareId: string;
    content: string;
    description?: string | undefined;
    active?: boolean | undefined;
    categories?: {
        added?: number[] | undefined;
        removed?: number[] | undefined;
    } | undefined;
};

/** put /api/v1/squares/:squareId */
type PutApiV1SquaresSquareIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        value: string;
        description: string | null;
        active: boolean;
        categories: string | null;
    };
};

/** put /api/v1/squares/:squareId */
interface PutApiV1SquaresSquareIdPositiveResponseVariants {
    200: PutApiV1SquaresSquareIdPositiveVariant1;
}

/** put /api/v1/squares/:squareId */
type PutApiV1SquaresSquareIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** put /api/v1/squares/:squareId */
interface PutApiV1SquaresSquareIdNegativeResponseVariants {
    400: PutApiV1SquaresSquareIdNegativeVariant1;
}

/** delete /api/v1/squares/:squareId */
type DeleteApiV1SquaresSquareIdInput = {
    squareId: string;
};

/** delete /api/v1/squares/:squareId */
type DeleteApiV1SquaresSquareIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        value: string;
        description: string | null;
        active: boolean;
        categories: string | null;
    };
};

/** delete /api/v1/squares/:squareId */
interface DeleteApiV1SquaresSquareIdPositiveResponseVariants {
    200: DeleteApiV1SquaresSquareIdPositiveVariant1;
}

/** delete /api/v1/squares/:squareId */
type DeleteApiV1SquaresSquareIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** delete /api/v1/squares/:squareId */
interface DeleteApiV1SquaresSquareIdNegativeResponseVariants {
    400: DeleteApiV1SquaresSquareIdNegativeVariant1;
}

/** get /api/v1/config */
type GetApiV1ConfigInput = {};

/** get /api/v1/config */
type GetApiV1ConfigPositiveVariant1 = {
    status: "success";
    data: {
        items: {
            id: number;
            key: string;
            value: string;
        }[];
    };
};

/** get /api/v1/config */
interface GetApiV1ConfigPositiveResponseVariants {
    200: GetApiV1ConfigPositiveVariant1;
}

/** get /api/v1/config */
type GetApiV1ConfigNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/config */
interface GetApiV1ConfigNegativeResponseVariants {
    400: GetApiV1ConfigNegativeVariant1;
}

/** head /api/v1/config */
type HeadApiV1ConfigInput = {};

/** head /api/v1/config */
type HeadApiV1ConfigPositiveVariant1 = undefined;

/** head /api/v1/config */
interface HeadApiV1ConfigPositiveResponseVariants {
    200: HeadApiV1ConfigPositiveVariant1;
}

/** head /api/v1/config */
type HeadApiV1ConfigNegativeVariant1 = undefined;

/** head /api/v1/config */
interface HeadApiV1ConfigNegativeResponseVariants {
    400: HeadApiV1ConfigNegativeVariant1;
}

/** post /api/v1/config */
type PostApiV1ConfigInput = {
    key: string;
    value: string;
};

/** post /api/v1/config */
type PostApiV1ConfigPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        key: string;
        value: string;
    };
};

/** post /api/v1/config */
interface PostApiV1ConfigPositiveResponseVariants {
    200: PostApiV1ConfigPositiveVariant1;
}

/** post /api/v1/config */
type PostApiV1ConfigNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** post /api/v1/config */
interface PostApiV1ConfigNegativeResponseVariants {
    400: PostApiV1ConfigNegativeVariant1;
}

/** get /api/v1/config/:configId */
type GetApiV1ConfigConfigIdInput = {
    configId: string;
};

/** get /api/v1/config/:configId */
type GetApiV1ConfigConfigIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        key: string;
        value: string;
    };
};

/** get /api/v1/config/:configId */
interface GetApiV1ConfigConfigIdPositiveResponseVariants {
    200: GetApiV1ConfigConfigIdPositiveVariant1;
}

/** get /api/v1/config/:configId */
type GetApiV1ConfigConfigIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /api/v1/config/:configId */
interface GetApiV1ConfigConfigIdNegativeResponseVariants {
    400: GetApiV1ConfigConfigIdNegativeVariant1;
}

/** head /api/v1/config/:configId */
type HeadApiV1ConfigConfigIdInput = {
    configId: string;
};

/** head /api/v1/config/:configId */
type HeadApiV1ConfigConfigIdPositiveVariant1 = undefined;

/** head /api/v1/config/:configId */
interface HeadApiV1ConfigConfigIdPositiveResponseVariants {
    200: HeadApiV1ConfigConfigIdPositiveVariant1;
}

/** head /api/v1/config/:configId */
type HeadApiV1ConfigConfigIdNegativeVariant1 = undefined;

/** head /api/v1/config/:configId */
interface HeadApiV1ConfigConfigIdNegativeResponseVariants {
    400: HeadApiV1ConfigConfigIdNegativeVariant1;
}

/** put /api/v1/config/:configId */
type PutApiV1ConfigConfigIdInput = {
    configId: string;
    key: string;
    value: string;
};

/** put /api/v1/config/:configId */
type PutApiV1ConfigConfigIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        key: string;
        value: string;
    };
};

/** put /api/v1/config/:configId */
interface PutApiV1ConfigConfigIdPositiveResponseVariants {
    200: PutApiV1ConfigConfigIdPositiveVariant1;
}

/** put /api/v1/config/:configId */
type PutApiV1ConfigConfigIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** put /api/v1/config/:configId */
interface PutApiV1ConfigConfigIdNegativeResponseVariants {
    400: PutApiV1ConfigConfigIdNegativeVariant1;
}

/** delete /api/v1/config/:configId */
type DeleteApiV1ConfigConfigIdInput = {
    configId: string;
};

/** delete /api/v1/config/:configId */
type DeleteApiV1ConfigConfigIdPositiveVariant1 = {
    status: "success";
    data: {
        id: number;
        key: string;
        value: string;
    };
};

/** delete /api/v1/config/:configId */
interface DeleteApiV1ConfigConfigIdPositiveResponseVariants {
    200: DeleteApiV1ConfigConfigIdPositiveVariant1;
}

/** delete /api/v1/config/:configId */
type DeleteApiV1ConfigConfigIdNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** delete /api/v1/config/:configId */
interface DeleteApiV1ConfigConfigIdNegativeResponseVariants {
    400: DeleteApiV1ConfigConfigIdNegativeVariant1;
}

export type Path = "/api/v1/login" | "/api/v1/logout" | "/api/v1/session" | "/api/v1/users" | "/api/v1/users/:userId" | "/api/v1/games" | "/api/v1/games/:gameId" | "/api/v1/groups" | "/api/v1/groups/:groupId" | "/api/v1/categories" | "/api/v1/categories/:categoryId" | "/api/v1/patterns" | "/api/v1/patterns/:patternId" | "/api/v1/squares" | "/api/v1/squares/:squareId" | "/api/v1/config" | "/api/v1/config/:configId";

export type Method = "get" | "post" | "put" | "delete" | "patch" | "head";

export interface Input {
    "post /api/v1/login": PostApiV1LoginInput;
    "post /api/v1/logout": PostApiV1LogoutInput;
    "get /api/v1/session": GetApiV1SessionInput;
    "head /api/v1/session": HeadApiV1SessionInput;
    "get /api/v1/users": GetApiV1UsersInput;
    "head /api/v1/users": HeadApiV1UsersInput;
    "post /api/v1/users": PostApiV1UsersInput;
    "get /api/v1/users/:userId": GetApiV1UsersUserIdInput;
    "head /api/v1/users/:userId": HeadApiV1UsersUserIdInput;
    "put /api/v1/users/:userId": PutApiV1UsersUserIdInput;
    "delete /api/v1/users/:userId": DeleteApiV1UsersUserIdInput;
    "get /api/v1/games": GetApiV1GamesInput;
    "head /api/v1/games": HeadApiV1GamesInput;
    "post /api/v1/games": PostApiV1GamesInput;
    "get /api/v1/games/:gameId": GetApiV1GamesGameIdInput;
    "head /api/v1/games/:gameId": HeadApiV1GamesGameIdInput;
    "put /api/v1/games/:gameId": PutApiV1GamesGameIdInput;
    "delete /api/v1/games/:gameId": DeleteApiV1GamesGameIdInput;
    "get /api/v1/groups": GetApiV1GroupsInput;
    "head /api/v1/groups": HeadApiV1GroupsInput;
    "post /api/v1/groups": PostApiV1GroupsInput;
    "get /api/v1/groups/:groupId": GetApiV1GroupsGroupIdInput;
    "head /api/v1/groups/:groupId": HeadApiV1GroupsGroupIdInput;
    "put /api/v1/groups/:groupId": PutApiV1GroupsGroupIdInput;
    "delete /api/v1/groups/:groupId": DeleteApiV1GroupsGroupIdInput;
    "get /api/v1/categories": GetApiV1CategoriesInput;
    "head /api/v1/categories": HeadApiV1CategoriesInput;
    "post /api/v1/categories": PostApiV1CategoriesInput;
    "get /api/v1/categories/:categoryId": GetApiV1CategoriesCategoryIdInput;
    "head /api/v1/categories/:categoryId": HeadApiV1CategoriesCategoryIdInput;
    "put /api/v1/categories/:categoryId": PutApiV1CategoriesCategoryIdInput;
    "delete /api/v1/categories/:categoryId": DeleteApiV1CategoriesCategoryIdInput;
    "get /api/v1/patterns": GetApiV1PatternsInput;
    "head /api/v1/patterns": HeadApiV1PatternsInput;
    "post /api/v1/patterns": PostApiV1PatternsInput;
    "get /api/v1/patterns/:patternId": GetApiV1PatternsPatternIdInput;
    "head /api/v1/patterns/:patternId": HeadApiV1PatternsPatternIdInput;
    "put /api/v1/patterns/:patternId": PutApiV1PatternsPatternIdInput;
    "delete /api/v1/patterns/:patternId": DeleteApiV1PatternsPatternIdInput;
    "get /api/v1/squares": GetApiV1SquaresInput;
    "head /api/v1/squares": HeadApiV1SquaresInput;
    "post /api/v1/squares": PostApiV1SquaresInput;
    "get /api/v1/squares/:squareId": GetApiV1SquaresSquareIdInput;
    "head /api/v1/squares/:squareId": HeadApiV1SquaresSquareIdInput;
    "put /api/v1/squares/:squareId": PutApiV1SquaresSquareIdInput;
    "delete /api/v1/squares/:squareId": DeleteApiV1SquaresSquareIdInput;
    "get /api/v1/config": GetApiV1ConfigInput;
    "head /api/v1/config": HeadApiV1ConfigInput;
    "post /api/v1/config": PostApiV1ConfigInput;
    "get /api/v1/config/:configId": GetApiV1ConfigConfigIdInput;
    "head /api/v1/config/:configId": HeadApiV1ConfigConfigIdInput;
    "put /api/v1/config/:configId": PutApiV1ConfigConfigIdInput;
    "delete /api/v1/config/:configId": DeleteApiV1ConfigConfigIdInput;
}

export interface PositiveResponse {
    "post /api/v1/login": SomeOf<PostApiV1LoginPositiveResponseVariants>;
    "post /api/v1/logout": SomeOf<PostApiV1LogoutPositiveResponseVariants>;
    "get /api/v1/session": SomeOf<GetApiV1SessionPositiveResponseVariants>;
    "head /api/v1/session": SomeOf<HeadApiV1SessionPositiveResponseVariants>;
    "get /api/v1/users": SomeOf<GetApiV1UsersPositiveResponseVariants>;
    "head /api/v1/users": SomeOf<HeadApiV1UsersPositiveResponseVariants>;
    "post /api/v1/users": SomeOf<PostApiV1UsersPositiveResponseVariants>;
    "get /api/v1/users/:userId": SomeOf<GetApiV1UsersUserIdPositiveResponseVariants>;
    "head /api/v1/users/:userId": SomeOf<HeadApiV1UsersUserIdPositiveResponseVariants>;
    "put /api/v1/users/:userId": SomeOf<PutApiV1UsersUserIdPositiveResponseVariants>;
    "delete /api/v1/users/:userId": SomeOf<DeleteApiV1UsersUserIdPositiveResponseVariants>;
    "get /api/v1/games": SomeOf<GetApiV1GamesPositiveResponseVariants>;
    "head /api/v1/games": SomeOf<HeadApiV1GamesPositiveResponseVariants>;
    "post /api/v1/games": SomeOf<PostApiV1GamesPositiveResponseVariants>;
    "get /api/v1/games/:gameId": SomeOf<GetApiV1GamesGameIdPositiveResponseVariants>;
    "head /api/v1/games/:gameId": SomeOf<HeadApiV1GamesGameIdPositiveResponseVariants>;
    "put /api/v1/games/:gameId": SomeOf<PutApiV1GamesGameIdPositiveResponseVariants>;
    "delete /api/v1/games/:gameId": SomeOf<DeleteApiV1GamesGameIdPositiveResponseVariants>;
    "get /api/v1/groups": SomeOf<GetApiV1GroupsPositiveResponseVariants>;
    "head /api/v1/groups": SomeOf<HeadApiV1GroupsPositiveResponseVariants>;
    "post /api/v1/groups": SomeOf<PostApiV1GroupsPositiveResponseVariants>;
    "get /api/v1/groups/:groupId": SomeOf<GetApiV1GroupsGroupIdPositiveResponseVariants>;
    "head /api/v1/groups/:groupId": SomeOf<HeadApiV1GroupsGroupIdPositiveResponseVariants>;
    "put /api/v1/groups/:groupId": SomeOf<PutApiV1GroupsGroupIdPositiveResponseVariants>;
    "delete /api/v1/groups/:groupId": SomeOf<DeleteApiV1GroupsGroupIdPositiveResponseVariants>;
    "get /api/v1/categories": SomeOf<GetApiV1CategoriesPositiveResponseVariants>;
    "head /api/v1/categories": SomeOf<HeadApiV1CategoriesPositiveResponseVariants>;
    "post /api/v1/categories": SomeOf<PostApiV1CategoriesPositiveResponseVariants>;
    "get /api/v1/categories/:categoryId": SomeOf<GetApiV1CategoriesCategoryIdPositiveResponseVariants>;
    "head /api/v1/categories/:categoryId": SomeOf<HeadApiV1CategoriesCategoryIdPositiveResponseVariants>;
    "put /api/v1/categories/:categoryId": SomeOf<PutApiV1CategoriesCategoryIdPositiveResponseVariants>;
    "delete /api/v1/categories/:categoryId": SomeOf<DeleteApiV1CategoriesCategoryIdPositiveResponseVariants>;
    "get /api/v1/patterns": SomeOf<GetApiV1PatternsPositiveResponseVariants>;
    "head /api/v1/patterns": SomeOf<HeadApiV1PatternsPositiveResponseVariants>;
    "post /api/v1/patterns": SomeOf<PostApiV1PatternsPositiveResponseVariants>;
    "get /api/v1/patterns/:patternId": SomeOf<GetApiV1PatternsPatternIdPositiveResponseVariants>;
    "head /api/v1/patterns/:patternId": SomeOf<HeadApiV1PatternsPatternIdPositiveResponseVariants>;
    "put /api/v1/patterns/:patternId": SomeOf<PutApiV1PatternsPatternIdPositiveResponseVariants>;
    "delete /api/v1/patterns/:patternId": SomeOf<DeleteApiV1PatternsPatternIdPositiveResponseVariants>;
    "get /api/v1/squares": SomeOf<GetApiV1SquaresPositiveResponseVariants>;
    "head /api/v1/squares": SomeOf<HeadApiV1SquaresPositiveResponseVariants>;
    "post /api/v1/squares": SomeOf<PostApiV1SquaresPositiveResponseVariants>;
    "get /api/v1/squares/:squareId": SomeOf<GetApiV1SquaresSquareIdPositiveResponseVariants>;
    "head /api/v1/squares/:squareId": SomeOf<HeadApiV1SquaresSquareIdPositiveResponseVariants>;
    "put /api/v1/squares/:squareId": SomeOf<PutApiV1SquaresSquareIdPositiveResponseVariants>;
    "delete /api/v1/squares/:squareId": SomeOf<DeleteApiV1SquaresSquareIdPositiveResponseVariants>;
    "get /api/v1/config": SomeOf<GetApiV1ConfigPositiveResponseVariants>;
    "head /api/v1/config": SomeOf<HeadApiV1ConfigPositiveResponseVariants>;
    "post /api/v1/config": SomeOf<PostApiV1ConfigPositiveResponseVariants>;
    "get /api/v1/config/:configId": SomeOf<GetApiV1ConfigConfigIdPositiveResponseVariants>;
    "head /api/v1/config/:configId": SomeOf<HeadApiV1ConfigConfigIdPositiveResponseVariants>;
    "put /api/v1/config/:configId": SomeOf<PutApiV1ConfigConfigIdPositiveResponseVariants>;
    "delete /api/v1/config/:configId": SomeOf<DeleteApiV1ConfigConfigIdPositiveResponseVariants>;
}

export interface NegativeResponse {
    "post /api/v1/login": SomeOf<PostApiV1LoginNegativeResponseVariants>;
    "post /api/v1/logout": SomeOf<PostApiV1LogoutNegativeResponseVariants>;
    "get /api/v1/session": SomeOf<GetApiV1SessionNegativeResponseVariants>;
    "head /api/v1/session": SomeOf<HeadApiV1SessionNegativeResponseVariants>;
    "get /api/v1/users": SomeOf<GetApiV1UsersNegativeResponseVariants>;
    "head /api/v1/users": SomeOf<HeadApiV1UsersNegativeResponseVariants>;
    "post /api/v1/users": SomeOf<PostApiV1UsersNegativeResponseVariants>;
    "get /api/v1/users/:userId": SomeOf<GetApiV1UsersUserIdNegativeResponseVariants>;
    "head /api/v1/users/:userId": SomeOf<HeadApiV1UsersUserIdNegativeResponseVariants>;
    "put /api/v1/users/:userId": SomeOf<PutApiV1UsersUserIdNegativeResponseVariants>;
    "delete /api/v1/users/:userId": SomeOf<DeleteApiV1UsersUserIdNegativeResponseVariants>;
    "get /api/v1/games": SomeOf<GetApiV1GamesNegativeResponseVariants>;
    "head /api/v1/games": SomeOf<HeadApiV1GamesNegativeResponseVariants>;
    "post /api/v1/games": SomeOf<PostApiV1GamesNegativeResponseVariants>;
    "get /api/v1/games/:gameId": SomeOf<GetApiV1GamesGameIdNegativeResponseVariants>;
    "head /api/v1/games/:gameId": SomeOf<HeadApiV1GamesGameIdNegativeResponseVariants>;
    "put /api/v1/games/:gameId": SomeOf<PutApiV1GamesGameIdNegativeResponseVariants>;
    "delete /api/v1/games/:gameId": SomeOf<DeleteApiV1GamesGameIdNegativeResponseVariants>;
    "get /api/v1/groups": SomeOf<GetApiV1GroupsNegativeResponseVariants>;
    "head /api/v1/groups": SomeOf<HeadApiV1GroupsNegativeResponseVariants>;
    "post /api/v1/groups": SomeOf<PostApiV1GroupsNegativeResponseVariants>;
    "get /api/v1/groups/:groupId": SomeOf<GetApiV1GroupsGroupIdNegativeResponseVariants>;
    "head /api/v1/groups/:groupId": SomeOf<HeadApiV1GroupsGroupIdNegativeResponseVariants>;
    "put /api/v1/groups/:groupId": SomeOf<PutApiV1GroupsGroupIdNegativeResponseVariants>;
    "delete /api/v1/groups/:groupId": SomeOf<DeleteApiV1GroupsGroupIdNegativeResponseVariants>;
    "get /api/v1/categories": SomeOf<GetApiV1CategoriesNegativeResponseVariants>;
    "head /api/v1/categories": SomeOf<HeadApiV1CategoriesNegativeResponseVariants>;
    "post /api/v1/categories": SomeOf<PostApiV1CategoriesNegativeResponseVariants>;
    "get /api/v1/categories/:categoryId": SomeOf<GetApiV1CategoriesCategoryIdNegativeResponseVariants>;
    "head /api/v1/categories/:categoryId": SomeOf<HeadApiV1CategoriesCategoryIdNegativeResponseVariants>;
    "put /api/v1/categories/:categoryId": SomeOf<PutApiV1CategoriesCategoryIdNegativeResponseVariants>;
    "delete /api/v1/categories/:categoryId": SomeOf<DeleteApiV1CategoriesCategoryIdNegativeResponseVariants>;
    "get /api/v1/patterns": SomeOf<GetApiV1PatternsNegativeResponseVariants>;
    "head /api/v1/patterns": SomeOf<HeadApiV1PatternsNegativeResponseVariants>;
    "post /api/v1/patterns": SomeOf<PostApiV1PatternsNegativeResponseVariants>;
    "get /api/v1/patterns/:patternId": SomeOf<GetApiV1PatternsPatternIdNegativeResponseVariants>;
    "head /api/v1/patterns/:patternId": SomeOf<HeadApiV1PatternsPatternIdNegativeResponseVariants>;
    "put /api/v1/patterns/:patternId": SomeOf<PutApiV1PatternsPatternIdNegativeResponseVariants>;
    "delete /api/v1/patterns/:patternId": SomeOf<DeleteApiV1PatternsPatternIdNegativeResponseVariants>;
    "get /api/v1/squares": SomeOf<GetApiV1SquaresNegativeResponseVariants>;
    "head /api/v1/squares": SomeOf<HeadApiV1SquaresNegativeResponseVariants>;
    "post /api/v1/squares": SomeOf<PostApiV1SquaresNegativeResponseVariants>;
    "get /api/v1/squares/:squareId": SomeOf<GetApiV1SquaresSquareIdNegativeResponseVariants>;
    "head /api/v1/squares/:squareId": SomeOf<HeadApiV1SquaresSquareIdNegativeResponseVariants>;
    "put /api/v1/squares/:squareId": SomeOf<PutApiV1SquaresSquareIdNegativeResponseVariants>;
    "delete /api/v1/squares/:squareId": SomeOf<DeleteApiV1SquaresSquareIdNegativeResponseVariants>;
    "get /api/v1/config": SomeOf<GetApiV1ConfigNegativeResponseVariants>;
    "head /api/v1/config": SomeOf<HeadApiV1ConfigNegativeResponseVariants>;
    "post /api/v1/config": SomeOf<PostApiV1ConfigNegativeResponseVariants>;
    "get /api/v1/config/:configId": SomeOf<GetApiV1ConfigConfigIdNegativeResponseVariants>;
    "head /api/v1/config/:configId": SomeOf<HeadApiV1ConfigConfigIdNegativeResponseVariants>;
    "put /api/v1/config/:configId": SomeOf<PutApiV1ConfigConfigIdNegativeResponseVariants>;
    "delete /api/v1/config/:configId": SomeOf<DeleteApiV1ConfigConfigIdNegativeResponseVariants>;
}

export interface EncodedResponse {
    "post /api/v1/login": PostApiV1LoginPositiveResponseVariants & PostApiV1LoginNegativeResponseVariants;
    "post /api/v1/logout": PostApiV1LogoutPositiveResponseVariants & PostApiV1LogoutNegativeResponseVariants;
    "get /api/v1/session": GetApiV1SessionPositiveResponseVariants & GetApiV1SessionNegativeResponseVariants;
    "head /api/v1/session": HeadApiV1SessionPositiveResponseVariants & HeadApiV1SessionNegativeResponseVariants;
    "get /api/v1/users": GetApiV1UsersPositiveResponseVariants & GetApiV1UsersNegativeResponseVariants;
    "head /api/v1/users": HeadApiV1UsersPositiveResponseVariants & HeadApiV1UsersNegativeResponseVariants;
    "post /api/v1/users": PostApiV1UsersPositiveResponseVariants & PostApiV1UsersNegativeResponseVariants;
    "get /api/v1/users/:userId": GetApiV1UsersUserIdPositiveResponseVariants & GetApiV1UsersUserIdNegativeResponseVariants;
    "head /api/v1/users/:userId": HeadApiV1UsersUserIdPositiveResponseVariants & HeadApiV1UsersUserIdNegativeResponseVariants;
    "put /api/v1/users/:userId": PutApiV1UsersUserIdPositiveResponseVariants & PutApiV1UsersUserIdNegativeResponseVariants;
    "delete /api/v1/users/:userId": DeleteApiV1UsersUserIdPositiveResponseVariants & DeleteApiV1UsersUserIdNegativeResponseVariants;
    "get /api/v1/games": GetApiV1GamesPositiveResponseVariants & GetApiV1GamesNegativeResponseVariants;
    "head /api/v1/games": HeadApiV1GamesPositiveResponseVariants & HeadApiV1GamesNegativeResponseVariants;
    "post /api/v1/games": PostApiV1GamesPositiveResponseVariants & PostApiV1GamesNegativeResponseVariants;
    "get /api/v1/games/:gameId": GetApiV1GamesGameIdPositiveResponseVariants & GetApiV1GamesGameIdNegativeResponseVariants;
    "head /api/v1/games/:gameId": HeadApiV1GamesGameIdPositiveResponseVariants & HeadApiV1GamesGameIdNegativeResponseVariants;
    "put /api/v1/games/:gameId": PutApiV1GamesGameIdPositiveResponseVariants & PutApiV1GamesGameIdNegativeResponseVariants;
    "delete /api/v1/games/:gameId": DeleteApiV1GamesGameIdPositiveResponseVariants & DeleteApiV1GamesGameIdNegativeResponseVariants;
    "get /api/v1/groups": GetApiV1GroupsPositiveResponseVariants & GetApiV1GroupsNegativeResponseVariants;
    "head /api/v1/groups": HeadApiV1GroupsPositiveResponseVariants & HeadApiV1GroupsNegativeResponseVariants;
    "post /api/v1/groups": PostApiV1GroupsPositiveResponseVariants & PostApiV1GroupsNegativeResponseVariants;
    "get /api/v1/groups/:groupId": GetApiV1GroupsGroupIdPositiveResponseVariants & GetApiV1GroupsGroupIdNegativeResponseVariants;
    "head /api/v1/groups/:groupId": HeadApiV1GroupsGroupIdPositiveResponseVariants & HeadApiV1GroupsGroupIdNegativeResponseVariants;
    "put /api/v1/groups/:groupId": PutApiV1GroupsGroupIdPositiveResponseVariants & PutApiV1GroupsGroupIdNegativeResponseVariants;
    "delete /api/v1/groups/:groupId": DeleteApiV1GroupsGroupIdPositiveResponseVariants & DeleteApiV1GroupsGroupIdNegativeResponseVariants;
    "get /api/v1/categories": GetApiV1CategoriesPositiveResponseVariants & GetApiV1CategoriesNegativeResponseVariants;
    "head /api/v1/categories": HeadApiV1CategoriesPositiveResponseVariants & HeadApiV1CategoriesNegativeResponseVariants;
    "post /api/v1/categories": PostApiV1CategoriesPositiveResponseVariants & PostApiV1CategoriesNegativeResponseVariants;
    "get /api/v1/categories/:categoryId": GetApiV1CategoriesCategoryIdPositiveResponseVariants & GetApiV1CategoriesCategoryIdNegativeResponseVariants;
    "head /api/v1/categories/:categoryId": HeadApiV1CategoriesCategoryIdPositiveResponseVariants & HeadApiV1CategoriesCategoryIdNegativeResponseVariants;
    "put /api/v1/categories/:categoryId": PutApiV1CategoriesCategoryIdPositiveResponseVariants & PutApiV1CategoriesCategoryIdNegativeResponseVariants;
    "delete /api/v1/categories/:categoryId": DeleteApiV1CategoriesCategoryIdPositiveResponseVariants & DeleteApiV1CategoriesCategoryIdNegativeResponseVariants;
    "get /api/v1/patterns": GetApiV1PatternsPositiveResponseVariants & GetApiV1PatternsNegativeResponseVariants;
    "head /api/v1/patterns": HeadApiV1PatternsPositiveResponseVariants & HeadApiV1PatternsNegativeResponseVariants;
    "post /api/v1/patterns": PostApiV1PatternsPositiveResponseVariants & PostApiV1PatternsNegativeResponseVariants;
    "get /api/v1/patterns/:patternId": GetApiV1PatternsPatternIdPositiveResponseVariants & GetApiV1PatternsPatternIdNegativeResponseVariants;
    "head /api/v1/patterns/:patternId": HeadApiV1PatternsPatternIdPositiveResponseVariants & HeadApiV1PatternsPatternIdNegativeResponseVariants;
    "put /api/v1/patterns/:patternId": PutApiV1PatternsPatternIdPositiveResponseVariants & PutApiV1PatternsPatternIdNegativeResponseVariants;
    "delete /api/v1/patterns/:patternId": DeleteApiV1PatternsPatternIdPositiveResponseVariants & DeleteApiV1PatternsPatternIdNegativeResponseVariants;
    "get /api/v1/squares": GetApiV1SquaresPositiveResponseVariants & GetApiV1SquaresNegativeResponseVariants;
    "head /api/v1/squares": HeadApiV1SquaresPositiveResponseVariants & HeadApiV1SquaresNegativeResponseVariants;
    "post /api/v1/squares": PostApiV1SquaresPositiveResponseVariants & PostApiV1SquaresNegativeResponseVariants;
    "get /api/v1/squares/:squareId": GetApiV1SquaresSquareIdPositiveResponseVariants & GetApiV1SquaresSquareIdNegativeResponseVariants;
    "head /api/v1/squares/:squareId": HeadApiV1SquaresSquareIdPositiveResponseVariants & HeadApiV1SquaresSquareIdNegativeResponseVariants;
    "put /api/v1/squares/:squareId": PutApiV1SquaresSquareIdPositiveResponseVariants & PutApiV1SquaresSquareIdNegativeResponseVariants;
    "delete /api/v1/squares/:squareId": DeleteApiV1SquaresSquareIdPositiveResponseVariants & DeleteApiV1SquaresSquareIdNegativeResponseVariants;
    "get /api/v1/config": GetApiV1ConfigPositiveResponseVariants & GetApiV1ConfigNegativeResponseVariants;
    "head /api/v1/config": HeadApiV1ConfigPositiveResponseVariants & HeadApiV1ConfigNegativeResponseVariants;
    "post /api/v1/config": PostApiV1ConfigPositiveResponseVariants & PostApiV1ConfigNegativeResponseVariants;
    "get /api/v1/config/:configId": GetApiV1ConfigConfigIdPositiveResponseVariants & GetApiV1ConfigConfigIdNegativeResponseVariants;
    "head /api/v1/config/:configId": HeadApiV1ConfigConfigIdPositiveResponseVariants & HeadApiV1ConfigConfigIdNegativeResponseVariants;
    "put /api/v1/config/:configId": PutApiV1ConfigConfigIdPositiveResponseVariants & PutApiV1ConfigConfigIdNegativeResponseVariants;
    "delete /api/v1/config/:configId": DeleteApiV1ConfigConfigIdPositiveResponseVariants & DeleteApiV1ConfigConfigIdNegativeResponseVariants;
}

export interface Response {
    "post /api/v1/login": PositiveResponse["post /api/v1/login"] | NegativeResponse["post /api/v1/login"];
    "post /api/v1/logout": PositiveResponse["post /api/v1/logout"] | NegativeResponse["post /api/v1/logout"];
    "get /api/v1/session": PositiveResponse["get /api/v1/session"] | NegativeResponse["get /api/v1/session"];
    "head /api/v1/session": PositiveResponse["head /api/v1/session"] | NegativeResponse["head /api/v1/session"];
    "get /api/v1/users": PositiveResponse["get /api/v1/users"] | NegativeResponse["get /api/v1/users"];
    "head /api/v1/users": PositiveResponse["head /api/v1/users"] | NegativeResponse["head /api/v1/users"];
    "post /api/v1/users": PositiveResponse["post /api/v1/users"] | NegativeResponse["post /api/v1/users"];
    "get /api/v1/users/:userId": PositiveResponse["get /api/v1/users/:userId"] | NegativeResponse["get /api/v1/users/:userId"];
    "head /api/v1/users/:userId": PositiveResponse["head /api/v1/users/:userId"] | NegativeResponse["head /api/v1/users/:userId"];
    "put /api/v1/users/:userId": PositiveResponse["put /api/v1/users/:userId"] | NegativeResponse["put /api/v1/users/:userId"];
    "delete /api/v1/users/:userId": PositiveResponse["delete /api/v1/users/:userId"] | NegativeResponse["delete /api/v1/users/:userId"];
    "get /api/v1/games": PositiveResponse["get /api/v1/games"] | NegativeResponse["get /api/v1/games"];
    "head /api/v1/games": PositiveResponse["head /api/v1/games"] | NegativeResponse["head /api/v1/games"];
    "post /api/v1/games": PositiveResponse["post /api/v1/games"] | NegativeResponse["post /api/v1/games"];
    "get /api/v1/games/:gameId": PositiveResponse["get /api/v1/games/:gameId"] | NegativeResponse["get /api/v1/games/:gameId"];
    "head /api/v1/games/:gameId": PositiveResponse["head /api/v1/games/:gameId"] | NegativeResponse["head /api/v1/games/:gameId"];
    "put /api/v1/games/:gameId": PositiveResponse["put /api/v1/games/:gameId"] | NegativeResponse["put /api/v1/games/:gameId"];
    "delete /api/v1/games/:gameId": PositiveResponse["delete /api/v1/games/:gameId"] | NegativeResponse["delete /api/v1/games/:gameId"];
    "get /api/v1/groups": PositiveResponse["get /api/v1/groups"] | NegativeResponse["get /api/v1/groups"];
    "head /api/v1/groups": PositiveResponse["head /api/v1/groups"] | NegativeResponse["head /api/v1/groups"];
    "post /api/v1/groups": PositiveResponse["post /api/v1/groups"] | NegativeResponse["post /api/v1/groups"];
    "get /api/v1/groups/:groupId": PositiveResponse["get /api/v1/groups/:groupId"] | NegativeResponse["get /api/v1/groups/:groupId"];
    "head /api/v1/groups/:groupId": PositiveResponse["head /api/v1/groups/:groupId"] | NegativeResponse["head /api/v1/groups/:groupId"];
    "put /api/v1/groups/:groupId": PositiveResponse["put /api/v1/groups/:groupId"] | NegativeResponse["put /api/v1/groups/:groupId"];
    "delete /api/v1/groups/:groupId": PositiveResponse["delete /api/v1/groups/:groupId"] | NegativeResponse["delete /api/v1/groups/:groupId"];
    "get /api/v1/categories": PositiveResponse["get /api/v1/categories"] | NegativeResponse["get /api/v1/categories"];
    "head /api/v1/categories": PositiveResponse["head /api/v1/categories"] | NegativeResponse["head /api/v1/categories"];
    "post /api/v1/categories": PositiveResponse["post /api/v1/categories"] | NegativeResponse["post /api/v1/categories"];
    "get /api/v1/categories/:categoryId": PositiveResponse["get /api/v1/categories/:categoryId"] | NegativeResponse["get /api/v1/categories/:categoryId"];
    "head /api/v1/categories/:categoryId": PositiveResponse["head /api/v1/categories/:categoryId"] | NegativeResponse["head /api/v1/categories/:categoryId"];
    "put /api/v1/categories/:categoryId": PositiveResponse["put /api/v1/categories/:categoryId"] | NegativeResponse["put /api/v1/categories/:categoryId"];
    "delete /api/v1/categories/:categoryId": PositiveResponse["delete /api/v1/categories/:categoryId"] | NegativeResponse["delete /api/v1/categories/:categoryId"];
    "get /api/v1/patterns": PositiveResponse["get /api/v1/patterns"] | NegativeResponse["get /api/v1/patterns"];
    "head /api/v1/patterns": PositiveResponse["head /api/v1/patterns"] | NegativeResponse["head /api/v1/patterns"];
    "post /api/v1/patterns": PositiveResponse["post /api/v1/patterns"] | NegativeResponse["post /api/v1/patterns"];
    "get /api/v1/patterns/:patternId": PositiveResponse["get /api/v1/patterns/:patternId"] | NegativeResponse["get /api/v1/patterns/:patternId"];
    "head /api/v1/patterns/:patternId": PositiveResponse["head /api/v1/patterns/:patternId"] | NegativeResponse["head /api/v1/patterns/:patternId"];
    "put /api/v1/patterns/:patternId": PositiveResponse["put /api/v1/patterns/:patternId"] | NegativeResponse["put /api/v1/patterns/:patternId"];
    "delete /api/v1/patterns/:patternId": PositiveResponse["delete /api/v1/patterns/:patternId"] | NegativeResponse["delete /api/v1/patterns/:patternId"];
    "get /api/v1/squares": PositiveResponse["get /api/v1/squares"] | NegativeResponse["get /api/v1/squares"];
    "head /api/v1/squares": PositiveResponse["head /api/v1/squares"] | NegativeResponse["head /api/v1/squares"];
    "post /api/v1/squares": PositiveResponse["post /api/v1/squares"] | NegativeResponse["post /api/v1/squares"];
    "get /api/v1/squares/:squareId": PositiveResponse["get /api/v1/squares/:squareId"] | NegativeResponse["get /api/v1/squares/:squareId"];
    "head /api/v1/squares/:squareId": PositiveResponse["head /api/v1/squares/:squareId"] | NegativeResponse["head /api/v1/squares/:squareId"];
    "put /api/v1/squares/:squareId": PositiveResponse["put /api/v1/squares/:squareId"] | NegativeResponse["put /api/v1/squares/:squareId"];
    "delete /api/v1/squares/:squareId": PositiveResponse["delete /api/v1/squares/:squareId"] | NegativeResponse["delete /api/v1/squares/:squareId"];
    "get /api/v1/config": PositiveResponse["get /api/v1/config"] | NegativeResponse["get /api/v1/config"];
    "head /api/v1/config": PositiveResponse["head /api/v1/config"] | NegativeResponse["head /api/v1/config"];
    "post /api/v1/config": PositiveResponse["post /api/v1/config"] | NegativeResponse["post /api/v1/config"];
    "get /api/v1/config/:configId": PositiveResponse["get /api/v1/config/:configId"] | NegativeResponse["get /api/v1/config/:configId"];
    "head /api/v1/config/:configId": PositiveResponse["head /api/v1/config/:configId"] | NegativeResponse["head /api/v1/config/:configId"];
    "put /api/v1/config/:configId": PositiveResponse["put /api/v1/config/:configId"] | NegativeResponse["put /api/v1/config/:configId"];
    "delete /api/v1/config/:configId": PositiveResponse["delete /api/v1/config/:configId"] | NegativeResponse["delete /api/v1/config/:configId"];
}

export type Request = keyof Input;

export const endpointTags = { "post /api/v1/login": [], "post /api/v1/logout": [], "get /api/v1/session": [], "head /api/v1/session": [], "get /api/v1/users": [], "head /api/v1/users": [], "post /api/v1/users": [], "get /api/v1/users/:userId": [], "head /api/v1/users/:userId": [], "put /api/v1/users/:userId": [], "delete /api/v1/users/:userId": [], "get /api/v1/games": [], "head /api/v1/games": [], "post /api/v1/games": [], "get /api/v1/games/:gameId": [], "head /api/v1/games/:gameId": [], "put /api/v1/games/:gameId": [], "delete /api/v1/games/:gameId": [], "get /api/v1/groups": [], "head /api/v1/groups": [], "post /api/v1/groups": [], "get /api/v1/groups/:groupId": [], "head /api/v1/groups/:groupId": [], "put /api/v1/groups/:groupId": [], "delete /api/v1/groups/:groupId": [], "get /api/v1/categories": [], "head /api/v1/categories": [], "post /api/v1/categories": [], "get /api/v1/categories/:categoryId": [], "head /api/v1/categories/:categoryId": [], "put /api/v1/categories/:categoryId": [], "delete /api/v1/categories/:categoryId": [], "get /api/v1/patterns": [], "head /api/v1/patterns": [], "post /api/v1/patterns": [], "get /api/v1/patterns/:patternId": [], "head /api/v1/patterns/:patternId": [], "put /api/v1/patterns/:patternId": [], "delete /api/v1/patterns/:patternId": [], "get /api/v1/squares": [], "head /api/v1/squares": [], "post /api/v1/squares": [], "get /api/v1/squares/:squareId": [], "head /api/v1/squares/:squareId": [], "put /api/v1/squares/:squareId": [], "delete /api/v1/squares/:squareId": [], "get /api/v1/config": [], "head /api/v1/config": [], "post /api/v1/config": [], "get /api/v1/config/:configId": [], "head /api/v1/config/:configId": [], "put /api/v1/config/:configId": [], "delete /api/v1/config/:configId": [] };

const parseRequest = (request: string) => request.split(/ (.+)/, 2) as [
    Method,
    Path
];

const substitute = (path: string, params: Record<string, any>) => { const rest = { ...params }; for (const key in params) {
    path = path.replace(`:${key}`, () => { delete rest[key]; return params[key]; });
} return [path, rest] as const; };

export type Implementation<T = unknown> = (method: Method, path: string, params: Record<string, any>, ctx?: T) => Promise<any>;

type Pagination = {
    nextCursor: string | null;
} | {
    total: number;
    limit: number;
    offset: number;
};

const defaultImplementation: Implementation = async (method, path, params) => { const hasBody = !["get", "head", "delete"].includes(method); const searchParams = hasBody ? "" : `?${new URLSearchParams(params)}`; const response = await fetch(new URL(`${path}${searchParams}`, ""), { method: method.toUpperCase(), headers: hasBody ? { "Content-Type": "application/json" } : undefined, body: hasBody ? JSON.stringify(params) : undefined }); const contentType = response.headers.get("content-type"); if (!contentType)
    return; const isJSON = contentType.startsWith("application/json"); return response[isJSON ? "json" : "text"](); };

export class ApiClient<T> {
    public constructor(protected readonly implementation: Implementation<T> = defaultImplementation) { }
    public provide<K extends Request>(request: K, params: Input[K], ctx?: T): Promise<Response[K]> { const [method, path] = parseRequest(request); return this.implementation(method, ...substitute(path, params), ctx); }
    public static hasMore(response: Pagination): boolean { if ("nextCursor" in response)
        return response.nextCursor !== null; return response.offset + response.limit < response.total; }
}

export class Subscription<K extends Extract<Request, `get ${string}`>, R extends Extract<PositiveResponse[K], { event: string; }>> {
    public source: EventSource;
    public constructor(request: K, params: Input[K]) { const [path, rest] = substitute(parseRequest(request)[1], params); const searchParams = `?${new URLSearchParams(rest)}`; this.source = new EventSource(new URL(`${path}${searchParams}`, "")); }
    public on<E extends R["event"]>(event: E, handler: (data: Extract<R, { event: E; }>["data"]) => void | Promise<void>) { this.source.addEventListener(event, msg => handler(JSON.parse((msg as MessageEvent).data))); return this; }
}

// Usage example:
/*
const client = new ApiClient();
client.provide("get /v1/user/retrieve", { id: "10" })
new Subscription("get /v1/events/stream", {}).on("time", time => { })*/ 