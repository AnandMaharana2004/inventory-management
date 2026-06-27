import bcrypt from "bcryptjs";

export async function comparePassword(password: string, hasedPassword: string) {
    const result = await bcrypt.compare(password, hasedPassword)
    return result
}

export async function hashPassword(password: string) {
    const result = await bcrypt.hash(password, 12)
    return result
}