export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOpernational:boolean;
    public readonly details?:any;
    constructor(message:string,statusCode:number,isOpertional=true,details?:any){
        super(message);
        this.statusCode=statusCode;
        this.isOpernational=isOpertional;
        this.details=details;
        Error.captureStackTrace(this);

    }
}

// Not Found error
export class NotFoundError extends AppError{
    constructor(message="Resources not found"){
        super(message,404)
    }
}

// Validation Error
export class ValidationError extends AppError{
    constructor(message="Invalid request data",details?:any){
        super(message,400,true,details)
    }
}

//Autehntication Error
export class AuthError extends AppError{
    constructor(message="Not Authorized"){
        super(message,401)
    }
}

//Forbidden Error
export class ForbiddenError extends AppError{
    constructor(message="Forbidden Access"){
        super(message,403)
    }
}

//Database Error
export class DatabaseError extends AppError{
    constructor(message="Database Error",details?:any){
        super(message,500,true,details)
    }
}

//Rate Limiting Error
export class RateLimitError extends AppError{
    constructor(message="Too Many Requests"){
        super(message,429)
    }
}
