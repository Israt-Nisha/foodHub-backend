import { prisma } from "../../lib/prisma";

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    include: { meals: true },
  });

  if (!categories || categories.length === 0) {
    throw new Error("No categories found");
  }

  return categories;
};

const getCategoryById = async (id: string) => {
  if (!id) throw new Error("Category ID is required");

  const category = await prisma.category.findUnique({
    where: { id },
    include: { meals: true },
  });

  if (!category) throw new Error("Category not found");

  return category;
};

const createCategory = async (payload: {
  name: string;
  slug: string;
  imageUrl?: string;
}) => {
  const { name, slug, imageUrl } = payload;

  if (!name) throw new Error("Category name is required!");
  if (!slug) throw new Error("Category slug is required!");

  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existingCategory) {
    if (existingCategory.name === name) {
      throw new Error("Category name already exists!");
    }
    if (existingCategory.slug === slug) {
      throw new Error("Category slug already exists!");
    }
  }

  return prisma.category.create({
     data: {
      name,
      slug,
      imageUrl: imageUrl ?? null,
    },
  });
};





const updateCategory = async (
  id: string,
  payload: {
    name?: string;
    slug?: string;
    imageUrl?: string;
  }
) => {
  const { name, slug, imageUrl } = payload;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error("Category not found!");

  
  if (name && name !== category.name) {
    const existingName = await prisma.category.findFirst({
      where: { name, NOT: { id } },
    });
    if (existingName) throw new Error("Category name already exists!");
  }

  if (slug && slug !== category.slug) {
    const existingSlug = await prisma.category.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existingSlug) throw new Error("Category slug already exists!");
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name: name ?? category.name,
      slug: slug ?? category.slug,
      imageUrl: imageUrl ?? category.imageUrl ?? null,
    },
  });

  return updatedCategory;
};




const deleteCategory = async (id: string) => {
  if (!id) throw new Error("Category ID is required!");

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error("Category not found!");

  await prisma.category.delete({ where: { id } });

  return true;
};

export const categoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};