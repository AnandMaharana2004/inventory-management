import { UserRole } from "@/lib/generated/prisma/enums";
import { hashPassword, comparePassword } from "@/lib/cripto";
import { BadRequestError, ConflictError, NotFoundError } from "@/lib/response";
import { userRepository } from "@/repositories/user.repository";
import type {
    CreateUserInput,
    UpdateUserInput,
    ChangePasswordInput,
} from "@/validation/user.validation";

const CreateUser = async (body: CreateUserInput) => {
    const { name, email, password, role, contactNumber } = body;

    // Check duplicate email
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
        throw new ConflictError("Email already exists.");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    return userRepository.create({
        name,
        email,
        passwordHash,
        role,
        contactNumber,
    });
};

const ListUsers = async (search?: string) => {
    if (search) {
        return userRepository.getUsersByName(search);
    }
    return userRepository.getAllUsers();
};

const GetUserById = async (id: number) => {
    const user = await userRepository.getUserById(id);
    if (!user) {
        throw new NotFoundError("User not found.");
    }
    return user;
};

const UpdateUser = async (id: number, body: UpdateUserInput) => {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
        throw new NotFoundError("User not found.");
    }

    // If email is being changed, make sure the new one isn't already taken
    if (body.email && body.email !== existingUser.email) {
        const emailOwner = await userRepository.getUserByEmail(body.email);
        if (emailOwner && emailOwner.id !== id) {
            throw new ConflictError("Email already exists.");
        }
    }

    return userRepository.updateUser(id, body);
};

const ActivateUser = async (id: number) => {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
        throw new NotFoundError("User not found.");
    }
    return userRepository.activateUser(id);
};

const DeactivateUser = async (id: number) => {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
        throw new NotFoundError("User not found.");
    }
    return userRepository.deactivateUser(id);
};

const DeleteUser = async (id: number) => {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
        throw new NotFoundError("User not found.");
    }
    return userRepository.deleteUser(id);
};

// Self-service only — operates on the requesting user's own id, never someone else's
const ChangeOwnPassword = async (userId: number, body: ChangePasswordInput) => {
    const { currentPassword, newPassword } = body;

    const user = await userRepository.getUserById(userId);
    if (!user) {
        throw new NotFoundError("User not found.");
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
        throw new BadRequestError("Current password is incorrect.");
    }

    const newPasswordHash = await hashPassword(newPassword);

    return userRepository.updateUser(userId, { passwordHash: newPasswordHash });
};

export const userService = {
    CreateUser,
    ListUsers,
    GetUserById,
    UpdateUser,
    ActivateUser,
    DeactivateUser,
    DeleteUser,
    ChangeOwnPassword,
};