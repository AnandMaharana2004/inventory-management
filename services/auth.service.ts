import { comparePassword } from "@/lib/cripto";
import { BadRequestError, } from "@/lib/response";
import { createAuthToken } from "@/lib/auth";
import { userRepository } from "@/repositories/user.repository";

interface ILoginInput {
    email: string;
    password: string;
}

const Login = async (body: ILoginInput) => {
    const { email, password } = body;

    const existUser =
        await userRepository.getUserByEmail(email);

    if (!existUser) {
        throw new BadRequestError(
            "Invalid Email or Password"
        );
    }

    if (!existUser.isActive) {
        throw new BadRequestError(
            "Account is inactive"
        );
    }

    const isPasswordValid =
        await comparePassword(
            password,
            existUser.passwordHash
        );

    if (!isPasswordValid) {
        throw new BadRequestError(
            "Invalid Email or Password"
        );
    }

    const token = createAuthToken({
        id: existUser.id,
        name: existUser.name,
        email: existUser.email ?? undefined,
        role: existUser.role,
    });

    return {
        token,
        user: {
            id: existUser.id,
            name: existUser.name,
            email: existUser.email,
            role: existUser.role,
        },
    };
};

export const authService = {
    Login,
};