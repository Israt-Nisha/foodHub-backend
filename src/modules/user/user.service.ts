import { date } from "better-auth";
import { OrderStatus, UserStatus } from "../../../prisma/generated/prisma/enums";
import { UserWhereInput } from "../../../prisma/generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../types/user.role";

interface ServiceResponse<T> {
  data: T | null;
  error: { message: string; statusCode: number } | null;
}


const getAllUsers = async ({
  search,
  page,
  limit,
  skip,
  role,
}: {
  search?: string;
  page: number;
  limit: number;
  skip: number;
  role: UserRole;
}) => {
  const andConditions: UserWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  const users = await prisma.user.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


const getUserById = async (id: string) => {

  await prisma.user.findUniqueOrThrow({ where: { id } });

  return prisma.user.findUnique({
    where: { id },
  });
};

const updateUserStatus = async (id: string, data: { status: UserStatus }) => {

  await prisma.user.findUniqueOrThrow({ where: { id } });

  return prisma.user.update({
    where: { id },
    data: {
      status: data.status,
    },
  });
};

const updateUser = async (
  id: string,
  payload: Partial<{
    name: string;
    email: string;
    role: string;
    status: string;
    image: string;
  }>,
): Promise<ServiceResponse<any>> => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user)
      return {
        data: null,
        error: { message: "User not found", statusCode: 404 },
      };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: payload,
    });

    return { data: updatedUser, error: null };
  } catch (err: any) {
    if (err.code === "P2002") {
      return {
        data: null,
        error: { message: "Email already exists", statusCode: 409 },
      };
    }
    return {
      data: null,
      error: { message: "Failed to update user", statusCode: 500 },
    };
  }
};

const deleteUser = async (id: string) => {

  await prisma.user.findUniqueOrThrow({ where: { id } });

  return prisma.user.delete({
    where: { id }
  });
};


const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const [
      totalUsers,
      totalAdmins,
      totalCustomers,
      totalProviders,

      activeUsers,
      suspendedUsers,

      totalMeals,
      totalCategories,
      totalProviderProfiles,

      totalOrders,
      placedOrders,
      readyOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,

      revenueResult
    ] = await Promise.all([

      tx.user.count(),
      tx.user.count({ where: { role: "ADMIN" } }),
      tx.user.count({ where: { role: "CUSTOMER" } }),
      tx.user.count({ where: { role: "PROVIDER" } }),

      tx.user.count({ where: { status: "ACTIVE" } }),
      tx.user.count({ where: { status: "SUSPENDED" } }),

      tx.meal.count(),
      tx.category.count(),
      tx.providerProfile.count(),

      tx.order.count(),
      tx.order.count({ where: { status: OrderStatus.PLACED } }),
      tx.order.count({ where: { status: OrderStatus.PREPARING } }),
      tx.order.count({ where: { status: OrderStatus.READY } }),
      tx.order.count({ where: { status: OrderStatus.DELIVERED } }),
      tx.order.count({ where: { status: OrderStatus.CANCELLED } }),

      tx.order.aggregate({
        _sum: { totalAmount: true }
      })
    ]);

    return {
    
      totalUsers,
      totalAdmins,
      totalCustomers,
      totalProviders,
      activeUsers,
      suspendedUsers,

     
      totalMeals,
      totalCategories,
      totalProviderProfiles,

      
      totalOrders,
      placedOrders,
      readyOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,

      totalRevenue: revenueResult._sum.totalAmount || 0
    };
  });
};



export const userService = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUser,
  deleteUser,
  getStats,

}