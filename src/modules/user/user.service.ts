import { UserStatus } from "../../../prisma/generated/prisma/enums";
import { UserWhereInput } from "../../../prisma/generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../types/user.role";


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


const updateUserStatus = async (id: string, data: { status: UserStatus }) => {
  return prisma.user.update({
    where: { id },
    data: {
      status: data.status,
    },
  });
};

export const userService = {
  getAllUsers,
  updateUserStatus,

}