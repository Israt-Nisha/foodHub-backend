import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import { UserRole } from "../../middlewares/auth";
import paginationSortingHelper from "../../helper/paginationSortingHelper";



const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    const searchTerm = typeof search === "string" ? search : undefined;

    const { page, limit, skip } = paginationSortingHelper(req.query);

    const params = {
      page,
      limit,
      skip,
      role: req.query.role as UserRole,
    };

    if (searchTerm) {
      Object.assign(params, { search: searchTerm });
    }

    const result = await userService.getAllUsers(params);

    res.status(201).json({
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
   
    const {id} =req.params;
    
    const result = await userService.getUserById(id as string);

    res.status(200).json({
      success: true,
      message: "User get by Id successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status } = req.body;

    const {id} =req.params;
    
    const result = await userService.updateUserStatus(id as string, { status });

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
   
    const {id} =req.params;

    const result = await userService.deleteUser(id as string);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const userController = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
};