// Success messages
export class ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;

    constructor(
        message: string,
        data?: T
    ) {
        this.success = true;
        this.message = message;
        this.data = data;
    }
}

// Error messages
export class AppError extends Error {
    statusCode: number;
    success: boolean;

    constructor(
        message: string,
        statusCode = 500
    ) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.success = false;

        Error.captureStackTrace(
            this,
            this.constructor
        );
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource Not Found") {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409);
    }
}

export class ValidationError extends AppError {
    constructor(message = "Validation Error") {
        super(message, 422);
    }
}

export class InternalServerError extends AppError {
    constructor(
        message = "Internal Server Error"
    ) {
        super(message, 500);
    }
}