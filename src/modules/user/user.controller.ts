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

    const { id } = req.params;

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

    const { id } = req.params;

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

const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await userService.updateUser(
      id as string,
      req.body,
    );
    if (error) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        data: null,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: "User updated successfully!",
      data,
      error: null,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating user!",
      data: null,
      error: err?.message || "Internal Server Error!",
    });
  }
};

const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const { id } = req.params;

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


const getStats = async (req: Request, res: Response) => {
  try {
    const result = await userService.getStats();
    res.status(200).json(result)
  } catch (e) {
    const errorMessage = (e instanceof Error) ? e.message : "Stats fetched failed!"
    res.status(400).json({
      error: errorMessage,
      details: e
    })
  }
}

export const userController = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUser,
  deleteUser,
  getStats,
};